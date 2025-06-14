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

@Injectable()
export class MovementInventoryService {
  constructor(
    @InjectRepository(MovementInventory)
    private readonly movementRepository: Repository<MovementInventory>,
    private readonly dataSource: DataSource, // Inyectamos DataSource para transacciones
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
}
