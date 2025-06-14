import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovementInventoryService } from './movement-inventory.service';
import { MovementInventoryController } from './movement-inventory.controller';
import { MovementInventory } from './entities/movement-inventory.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { User } from '../user/entities/user.entity';
import { TypeMovement } from '../type-movement/entities/type-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MovementInventory, Inventory, User, TypeMovement])],
  controllers: [MovementInventoryController],
  providers: [MovementInventoryService],
})
export class MovementInventoryModule {}
