import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';

// Entidades utilizadas por este módulo
import { Sale } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { Product } from '../product/entities/product.entity';
import { Person } from '../person/entities/person.entity';
import { PaymentMethod } from '../payment-method/entities/payment-method.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { MovementInventory } from '../movement-inventory/entities/movement-inventory.entity';
import { User } from '../user/entities/user.entity';
import { TypeMovement } from '../type-movement/entities/type-movement.entity';

@Module({
  imports: [
    // TypeOrmModule.forFeature() hace que los repositorios de estas entidades
    // estén disponibles para ser inyectados en este módulo.
    TypeOrmModule.forFeature([
      Sale,
      SaleDetail,
      Product,
      Person,
      PaymentMethod,
      Inventory,
      MovementInventory,
      User,
      TypeMovement
    ]),
  ],
  controllers: [SaleController],
  providers: [SaleService],
})
export class SaleModule {}
