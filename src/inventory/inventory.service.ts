import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Product } from '../product/entities/product.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

/**
 * Este servicio gestiona todas las operaciones de la base de datos
 * relacionadas con el inventario de productos.
 */
@Injectable()
export class InventoryService {
  remove(id: number) {
    throw new Error('Method not implemented.');
  }
 
  /**
   * El constructor inyecta las dependencias de los repositorios de TypeORM
   * para las entidades Inventory y Product.
   * @param inventoryRepository Repositorio para la entidad Inventory.
   * @param productRepository Repositorio para la entidad Product.
   */
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    // Se inyecta el repositorio de Product para validar la existencia de un producto.
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Crea un nuevo registro de inventario para un producto.
   * Valida que el producto exista y que no tenga ya un inventario asignado.
   * @param createInventoryDto - Los datos para crear el inventario.
   * @returns El registro de inventario creado.
   */
  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    // 1. Validar que el producto al que se le asignará inventario realmente exista.
    const product = await this.productRepository.findOneBy({
      idproduct: createInventoryDto.producto_id,
    });
    if (!product) {
      throw new NotFoundException(
        `No se puede crear el inventario porque el producto con ID #${createInventoryDto.producto_id} no fue encontrado.`,
      );
    }

    // 2. Validar que no exista ya un inventario para este producto.
    const existingInventory = await this.inventoryRepository.findOne({
      where: { producto_id: { idproduct: createInventoryDto.producto_id } },
    });
    if (existingInventory) {
      throw new ConflictException(
        `El producto con ID #${createInventoryDto.producto_id} ya tiene un registro de inventario asignado.`,
      );
    }

    // 3. Crear la nueva entidad de inventario.
    const newInventoryItem = this.inventoryRepository.create({
      producto_id: product,
      cantidad: createInventoryDto.cantidad || 0, // Si no se provee la cantidad, por defecto es 0.
      fecha_actualizacion: new Date(),
    });

    // 4. Guardar en la base de datos y manejar errores.
    try {
      return await this.inventoryRepository.save(newInventoryItem);
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocurrió un error al guardar el nuevo registro de inventario.',
      );
    }
  }

  /**
   * Devuelve todos los registros de inventario con la información de su producto asociado.
   * @returns Un arreglo de todos los registros de inventario.
   */
  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      relations: ['producto_id'], // Cargar datos del producto relacionado
    });
  }

  /**
   * Busca el inventario de un producto específico por el ID del PRODUCTO.
   * @param productId - El ID del producto a buscar.
   * @returns El registro de inventario encontrado.
   */
  async findOneByProductId(productId: number): Promise<Inventory> {
    const inventoryItem = await this.inventoryRepository.findOne({
      where: { producto_id: { idproduct: productId } },
      relations: ['producto_id'],
    });

    if (!inventoryItem) {
      throw new NotFoundException(
        `No se encontró inventario para el producto con ID #${productId}.`,
      );
    }
    return inventoryItem;
  }

  /**
   * Actualiza el inventario de un producto específico por el ID del PRODUCTO.
   * @param productId - El ID del producto cuyo inventario se actualizará.
   * @param updateInventoryDto - Los datos para actualizar la cantidad.
   * @returns El registro de inventario actualizado.
   */
  async updateByProductId(
    productId: number,
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    // Reutilizamos findOneByProductId para buscar y manejar el caso de no encontrado.
    const inventoryItem = await this.findOneByProductId(productId);

    inventoryItem.cantidad = updateInventoryDto.cantidad;
    inventoryItem.fecha_actualizacion = new Date();

    return this.inventoryRepository.save(inventoryItem);
  }
  /**
   * Elimina el registro de inventario de un producto específico por el ID del PRODUCTO.
   * @param productId - El ID del producto cuyo inventario se eliminará.
   * @returns El registro de inventario que fue eliminado (o void si prefieres no devolver nada).
   */
  async removeByProductId(productId: number): Promise<Inventory> {
    // Reutilizamos findOneByProductId para buscar y manejar el caso de no encontrado.
    const inventoryItemToRemove = await this.findOneByProductId(productId);

    // Si findOneByProductId no lo encuentra, ya habrá lanzado un NotFoundException.
    // Usamos 'remove' del repositorio para eliminar la entidad.
    await this.inventoryRepository.remove(inventoryItemToRemove);

    // Devolvemos el objeto eliminado como confirmación.
    return inventoryItemToRemove;
  }
}
