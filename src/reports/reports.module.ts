import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
// Importamos todas las entidades que el servicio de reportes necesita leer
import { Sale } from '../sale/entities/sale.entity';
import { SaleDetail } from '../sale/entities/sale-detail.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../product/entities/product.entity';
import { MovementInventory } from 'src/movement-inventory/entities/movement-inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale, 
      SaleDetail, 
      Inventory, 
      Product,
      MovementInventory,
      ]), // Importamos las entidades necesarias para los reportes
  ],
  controllers: [ReportsController],
  providers: [ReportsService],

})
export class ReportsModule {}
