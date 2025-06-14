import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { PersonModule } from './person/person.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { InventoryModule } from './inventory/inventory.module';
import { MovementInventoryModule } from './movement-inventory/movement-inventory.module';
import { TypeMovementModule } from './type-movement/type-movement.module';
import { SaleModule } from './sale/sale.module';

import { TipoIdentificacionModule } from './tipo-identificacion/tipo-identificacion.module';
import { TypePersonModule } from './type-person/type-person.module';

import { PaymentMethodModule } from './payment-method/payment-method.module';

@Module({
  imports: [DashboardModule, PersonModule, UserModule, CategoryModule, ProductModule, InventoryModule, MovementInventoryModule, TypeMovementModule, SaleModule,  TipoIdentificacionModule, TypePersonModule, PaymentMethodModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
