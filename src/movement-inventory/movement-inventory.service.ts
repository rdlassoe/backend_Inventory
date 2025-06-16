import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MovementInventory } from './entities/movement-inventory.entity';
import { CreateMovementDto } from './dto/create-movement-inventory.dto';
import { Inventory } from '../inventory/entities/inventory.entity';
import { User } from '../user/entities/user.entity';
import { TypeMovement } from '../type-movement/entities/type-movement.entity';
import { ConfigService } from '@nestjs/config';
import { UpdateMovementInventoryDto } from './dto/update-movement-inventory.dto';



@Injectable()
export class MovementInventoryService {
  constructor(
    @InjectRepository(MovementInventory)
    private readonly movementRepository: Repository<MovementInventory>,
    private readonly dataSource: DataSource, // Inyectamos DataSource para transacciones
    private readonly configService: ConfigService, // Para acceder a variables de entorno si es necesario

  ) {}

  async create(dto: CreateMovementDto): Promise<MovementInventory> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar existencias (User, TypeMovement, Inventory)
      const user = await queryRunner.manager.findOneBy(User, {
        iduser: dto.user_id,
      });
      if (!user)
        throw new NotFoundException(
          `Usuario con ID #${dto.user_id} no encontrado.`,
        );

      const typeMovement = await queryRunner.manager.findOneBy(TypeMovement, {
        idtype_movement: dto.movement_type_id,
      });
      if (!typeMovement)
        throw new NotFoundException(
          `Tipo de movimiento con ID #${dto.movement_type_id} no encontrado.`,
        );

      const inventoryItem = await queryRunner.manager.findOne(Inventory, {
        where: { producto_id: { idproduct: dto.producto_id } },
      });
      if (!inventoryItem)
        throw new NotFoundException(
          `Inventario para el producto con ID #${dto.producto_id} no encontrado.`,
        );

      // 2. Lógica de negocio (verificar stock si es salida)
      const newStock = inventoryItem.cantidad + dto.cantidad;
      if (newStock < 0) {
        throw new BadRequestException(
          `No hay suficiente stock. Cantidad actual: ${inventoryItem.cantidad}, se intentó reducir en ${Math.abs(dto.cantidad)}.`,
        );
      }

      // 3. Actualizar el inventario
      inventoryItem.cantidad = newStock;
      inventoryItem.fecha_actualizacion = new Date();
      await queryRunner.manager.save(inventoryItem);

      // 4. Crear el registro del movimiento
      const newMovement = this.movementRepository.create({
        ...dto,
        fecha: new Date(),
        inventario_id: inventoryItem,
        movement_type_id: typeMovement,
        user_id: user,
      });
      const savedMovement = await queryRunner.manager.save(newMovement);

      // 5. Confirmar transacción
      await queryRunner.commitTransaction();
      return savedMovement;
    } catch (error) {
      // Si algo falla, revertir todo
      await queryRunner.rollbackTransaction();
      throw error; // Relanzar el error para que Nest lo maneje
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  findAll() {
    return this.movementRepository.find({
      relations: [
        'inventario_id',
        'inventario_id.producto_id',
        'movement_type_id',
        'user_id',
      ],
    });
  }
  async findOne(id: number): Promise<MovementInventory> {
    const movement = await this.movementRepository.findOne({
      where: { idmovement_inventory: id },
      relations: [
        'inventario_id',
        'inventario_id.producto_id',
        'movement_type_id',
        'user_id',
      ],
    });
    if (!movement) {
      throw new NotFoundException(
        `Movimiento de inventario con ID #${id} no encontrado.`,
      );
    }
    return movement;
  }

  async update(
    id: number,
    dto: UpdateMovementInventoryDto,
  ): Promise<MovementInventory> {
    // Nota: Actualizar un movimiento de inventario puede ser complejo
    // debido a su impacto en el stock. Generalmente, los movimientos
    // no se "actualizan" directamente, sino que se crean movimientos de ajuste.
    // Esta implementación es una actualización simple de los campos del movimiento.
    // Si necesitas revertir y aplicar un nuevo cálculo de stock, la lógica sería más compleja.

    const movement = await this.findOne(id); // Reutiliza findOne para verificar existencia

    // No permitiremos cambiar la cantidad, el producto o el tipo de movimiento
    // ya que eso requeriría recalcular el stock y es propenso a errores.
    // Solo permitiremos actualizar la descripción o la fecha si es necesario.

    if (dto.descripcion !== undefined) {
      movement.descripcion = dto.descripcion;
    }

    // Si se permite cambiar la fecha, asegúrate de que el formato sea correcto.
    if (dto.fecha) {
        try {
            movement.fecha = new Date(dto.fecha);
        } catch (error) {
            throw new BadRequestException('Formato de fecha inválido para la actualización.');
        }
    }

    // No se permite cambiar user_id, movement_type_id, inventario_id (producto_id) o cantidad
    // directamente aquí para evitar inconsistencias en el stock.
    // Esos cambios deberían manejarse con nuevos movimientos de ajuste o cancelación.
    if (dto.user_id && dto.user_id !== movement.user_id.iduser) {
        throw new BadRequestException('No se permite cambiar el usuario del movimiento.');
    }
    if (dto.movement_type_id && dto.movement_type_id !== movement.movement_type_id.idtype_movement) {
        throw new BadRequestException('No se permite cambiar el tipo de movimiento.');
    }
    if (dto.producto_id && dto.producto_id !== movement.inventario_id.producto_id.idproduct) {
        throw new BadRequestException('No se permite cambiar el producto del movimiento.');
    }
    if (dto.cantidad !== undefined && dto.cantidad !== movement.cantidad) {
        throw new BadRequestException('No se permite cambiar la cantidad del movimiento. Genere un movimiento de ajuste.');
    }


    try {
      return await this.movementRepository.save(movement);
    } catch (error) {
      // Manejar errores específicos si es necesario, ej. error.code
      throw new BadRequestException(
        'Error al actualizar el movimiento de inventario.',
      );
    }
  }

  async remove(id: number): Promise<MovementInventory> {
    // Importante: Eliminar un movimiento de inventario debería, idealmente,
    // revertir el efecto que tuvo en el stock. Esta es una operación delicada.
    // La implementación actual solo elimina el registro del movimiento.
    // Para una lógica completa, necesitarías una transacción para:
    // 1. Obtener el movimiento.
    // 2. Ajustar el stock del inventario (sumar si fue salida, restar si fue entrada).
    // 3. Eliminar el movimiento.

    const movementToRemove = await this.findOne(id); // Reutiliza findOne

    // ADVERTENCIA: La siguiente lógica de ajuste de stock es simplificada y
    // podría necesitar más validaciones en un sistema real.
    // const inventoryItem = movementToRemove.inventario_id;
    // inventoryItem.cantidad -= movementToRemove.cantidad; // Revertir el cambio de cantidad
    // await this.dataSource.manager.save(Inventory, inventoryItem); // Guardar el inventario ajustado

    // Por ahora, solo eliminaremos el registro del movimiento.
    // Considera las implicaciones en el stock.
    await this.movementRepository.remove(movementToRemove);
    return movementToRemove; // Devuelve el objeto eliminado
  }
}
