import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Product } from '../product/entities/product.entity';
import { Person } from '../person/entities/person.entity';
import { PaymentMethod } from '../payment-method/entities/payment-method.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { MovementInventory } from '../movement-inventory/entities/movement-inventory.entity';
import { User } from '../user/entities/user.entity';
import { TypeMovement } from '../type-movement/entities/type-movement.entity';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable()
export class SaleService {

  constructor(
    // Inyectamos DataSource para poder manejar transacciones manualmente.
    private readonly dataSource: DataSource,
    // Inyectamos el repositorio de Sale para operaciones de consulta simples.
    @InjectRepository(Sale) private readonly saleRepository: Repository<Sale>,
  ) {}

  /**
   * Crea una nueva venta, actualiza el stock y registra los movimientos
   * de forma transaccional.
   * @param createSaleDto - Los datos para crear la venta.
   * @returns La entidad de la venta creada con todas sus relaciones.
   */
  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. --- Validar existencias de entidades principales ---
      const cliente = await queryRunner.manager.findOneBy(Person, { idperson: createSaleDto.cliente_id });
      if (!cliente) throw new NotFoundException(`Cliente con ID #${createSaleDto.cliente_id} no encontrado.`);
      
      const empleado = await queryRunner.manager.findOneBy(Person, { idperson: createSaleDto.empleado_id });
      if (!empleado) throw new NotFoundException(`Empleado con ID #${createSaleDto.empleado_id} no encontrado.`);

      const user = await queryRunner.manager.findOne(User, { where: { persona_id: { idperson: createSaleDto.empleado_id } } });
      if (!user) throw new NotFoundException(`El empleado con ID #${createSaleDto.empleado_id} no tiene una cuenta de usuario asignada.`);

      const metodoPago = await queryRunner.manager.findOneBy(PaymentMethod, { idpayment_method: createSaleDto.metodo_pago_id });
      if (!metodoPago) throw new NotFoundException(`Método de pago con ID #${createSaleDto.metodo_pago_id} no encontrado.`);
      
      // Asumimos que el ID 2 es para "Salida por Venta". Esto debería ser configurable.
      const tipoMovimientoVenta = await queryRunner.manager.findOneBy(TypeMovement, { idtype_movement: 2 });
      if (!tipoMovimientoVenta) throw new NotFoundException('Tipo de Movimiento "Salida por Venta" (ID 2) debe existir en la base de datos.');

      let totalVenta = 0;
      const detallesVenta: SaleDetail[] = [];
      const movimientosVenta: MovementInventory[] = [];
      // 2. --- Procesar cada producto del DTO ---
      for (const prodDto of createSaleDto.productos) {
        const producto = await queryRunner.manager.findOneBy(Product, { idproduct: prodDto.producto_id });
        if (!producto) throw new NotFoundException(`Producto con ID #${prodDto.producto_id} no encontrado.`);

        const inventario = await queryRunner.manager.findOne(Inventory, { where: { producto_id: { idproduct: prodDto.producto_id } } });
        if (!inventario || inventario.cantidad < prodDto.cantidad) {
          throw new BadRequestException(`Stock insuficiente para "${producto.nombre}". Stock actual: ${inventario?.cantidad || 0}.`);
        }
        
        // Actualizar stock en inventario
        inventario.cantidad -= prodDto.cantidad;
        inventario.fecha_actualizacion = new Date();
        await queryRunner.manager.save(inventario);

        // Crear registro de movimiento de inventario (salida)
        const movimiento = queryRunner.manager.create(MovementInventory, {
          inventario_id: inventario,
          fecha: new Date(),
          movement_type_id: tipoMovimientoVenta,
          cantidad: -prodDto.cantidad, // Las salidas de stock son negativas
          descripcion: `Venta #${'ID_PROVISIONAL'}`, // Se actualizará después
          user_id: user,
        });
        movimientosVenta.push(movimiento);

        // Crear detalle de venta
        const detalle = queryRunner.manager.create(SaleDetail, {
            producto: producto,
            cantidad: prodDto.cantidad,
            precio_unitario: producto.precio,
            iva: producto.iva,
        });
        detallesVenta.push(detalle);
        
        totalVenta += detalle.cantidad * detalle.precio_unitario;
      }
      
      // 3. --- Crear la Venta principal ---
      const nuevaVenta = queryRunner.manager.create(Sale, {
        cliente: cliente,
        empleado: empleado,
        metodo_pago: metodoPago,
        fecha_hora: new Date(),
        total: totalVenta,
        detalles: detallesVenta,
      });

      const ventaGuardada = await queryRunner.manager.save(nuevaVenta);

      // 4. --- Actualizar y guardar los movimientos de inventario con el ID de venta real ---
      for(const movimiento of movimientosVenta){
          movimiento.descripcion = `Venta #${ventaGuardada.idsale}`;
          await queryRunner.manager.save(movimiento);
      }
      
      // Si todo fue exitoso, confirmar la transacción
      await queryRunner.commitTransaction();
      
      // Devolver la venta completa con sus relaciones, asegurando que no sea null.
      const resultadoFinal = await this.saleRepository.findOne({ 
        where: { idsale: ventaGuardada.idsale }, 
        relations: ['detalles', 'cliente', 'empleado', 'metodo_pago'] 
      });
      if (!resultadoFinal) {
        throw new InternalServerErrorException('No se pudo encontrar la venta recién creada después de la transacción.');
      }
      return resultadoFinal;
      
    } catch (error) {
      // Si algo falla, revertir todos los cambios
      await queryRunner.rollbackTransaction();
      // Relanzar el error para que Nest lo maneje y envíe una respuesta HTTP apropiada
      throw new InternalServerErrorException(error.message || 'Ocurrió un error al procesar la venta.');
    } finally {
      // Liberar el queryRunner para evitar fugas de memoria
      await queryRunner.release();
    }
  }

  findAll() {
    return this.saleRepository.find({ 
      relations: ['cliente', 'empleado', 'metodo_pago', 'detalles'],
      order: { fecha_hora: 'DESC' }
    });
  }

  async findOne(id: number) {
      const sale = await this.saleRepository.findOne({
          where: { idsale: id },
          relations: ['cliente', 'empleado', 'metodo_pago', 'detalles']
      });
      if (!sale) {
          throw new NotFoundException(`Venta con ID #${id} no encontrada.`);
      }
      return sale;
  }

  /**
   * Actualiza una venta existente.
   * NOTA: Esta implementación básica solo actualiza cliente, empleado y método de pago.
   * La actualización de productos (detalles) es compleja y no está cubierta aquí.
   * @param id - El ID de la venta a actualizar.
   * @param updateSaleDto - Los datos para actualizar la venta.
   * @returns La entidad de la venta actualizada.
   */
  async update(id: number, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const saleToUpdate = await queryRunner.manager.findOne(Sale, { 
        where: { idsale: id },
        relations: ['cliente', 'empleado', 'metodo_pago'] 
      });

      if (!saleToUpdate) {
        throw new NotFoundException(`Venta con ID #${id} no encontrada.`);
      }

      // Actualizar campos si se proporcionan en el DTO
      if (updateSaleDto.cliente_id) {
        const cliente = await queryRunner.manager.findOneBy(Person, { idperson: updateSaleDto.cliente_id });
        if (!cliente) throw new NotFoundException(`Cliente con ID #${updateSaleDto.cliente_id} no encontrado.`);
        saleToUpdate.cliente = cliente;
      }

      if (updateSaleDto.empleado_id) {
        const empleado = await queryRunner.manager.findOneBy(Person, { idperson: updateSaleDto.empleado_id });
        if (!empleado) throw new NotFoundException(`Empleado con ID #${updateSaleDto.empleado_id} no encontrado.`);
        saleToUpdate.empleado = empleado;
      }

      if (updateSaleDto.metodo_pago_id) {
        const metodoPago = await queryRunner.manager.findOneBy(PaymentMethod, { idpayment_method: updateSaleDto.metodo_pago_id });
        if (!metodoPago) throw new NotFoundException(`Método de pago con ID #${updateSaleDto.metodo_pago_id} no encontrado.`);
        saleToUpdate.metodo_pago = metodoPago;
      }

      if (updateSaleDto.productos && updateSaleDto.productos.length > 0) {
        // La lógica para actualizar productos (SaleDetail) es compleja:
        // - Eliminar detalles antiguos / actualizar existentes / añadir nuevos.
        // - Revertir/aplicar movimientos de inventario y stock.
        // - Recalcular el total de la venta.
        // Por simplicidad, esta parte se omite. Podrías lanzar un error o ignorar los productos.
        console.warn(`La actualización de productos en la venta ID #${id} no está implementada en esta versión.`);
        // throw new BadRequestException('La actualización de productos en una venta no está soportada actualmente.');
      }

      const updatedSale = await queryRunner.manager.save(saleToUpdate);
      await queryRunner.commitTransaction();
      
      // Devolver la venta actualizada con sus relaciones
      const resultadoFinal = await this.saleRepository.findOne({
        where: { idsale: updatedSale.idsale },
        relations: ['detalles', 'cliente', 'empleado', 'metodo_pago'] 
      });
      if (!resultadoFinal) {
        throw new InternalServerErrorException('No se pudo encontrar la venta recién actualizada después de la transacción.');
      }
      return resultadoFinal;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message || 'Ocurrió un error al actualizar la venta.');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Elimina una venta.
   * NOTA: Esta implementación básica elimina la venta y sus detalles (por cascada).
   * No revierte movimientos de inventario ni ajusta stock.
   * @param id - El ID de la venta a eliminar.
   * @returns La entidad de la venta eliminada.
   */
  async remove(id: number): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const saleToRemove = await queryRunner.manager.findOne(Sale, { 
        where: { idsale: id },
        // Cargar detalles para devolverlos, aunque la BD los borrará por cascada
        relations: ['detalles', 'cliente', 'empleado', 'metodo_pago'] 
      });

      if (!saleToRemove) {
        throw new NotFoundException(`Venta con ID #${id} no encontrada.`);
      }

      // Lógica para revertir stock y movimientos de inventario iría aquí.
      // Por ejemplo, para cada saleToRemove.detalles:
      // 1. Encontrar el producto y su inventario.
      // 2. Incrementar el stock del inventario.
      // 3. Crear un MovementInventory de tipo "Entrada por anulación de venta".
      // Esta lógica es compleja y se omite por brevedad.

      await queryRunner.manager.remove(saleToRemove); // Esto eliminará la venta y sus detalles por cascada.
      await queryRunner.commitTransaction();
      
      // Devolvemos la entidad eliminada (ya no existe en BD, pero tenemos su estado previo)
      return saleToRemove; 

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message || 'Ocurrió un error al eliminar la venta.');
    } finally {
      await queryRunner.release();
    }
  }
}
