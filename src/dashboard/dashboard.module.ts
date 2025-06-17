import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

// Importamos TODAS las entidades que el servicio de Dashboard necesita.
import { Product } from '../product/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Sale } from '../sale/entities/sale.entity';
import { SaleDetail } from '../sale/entities/sale-detail.entity';
import { MovementInventory } from '../movement-inventory/entities/movement-inventory.entity';
import { User } from '../user/entities/user.entity';
import { TypeMovement } from '../type-movement/entities/type-movement.entity';
import { Person } from '../person/entities/person.entity'; // <-- Añadido para la relación con Cliente en Sale

@Module({
  imports: [
    // Hacemos que los repositorios de estas entidades estén disponibles para este módulo.
    TypeOrmModule.forFeature([
      Product, 
      Inventory, 
      Sale, 
      SaleDetail, 
      MovementInventory,
      User,
      TypeMovement,
      Person // <-- Añadido
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
