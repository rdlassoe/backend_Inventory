import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory } from './entities/inventory.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Product])],
  controllers: [InventoryController],
  providers: [InventoryService],
  // Exportamos para que otros módulos (como Product) puedan usarlo
  exports: [TypeOrmModule, InventoryService], 
})
export class InventoryModule {}
