import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Las importaciones de arriba se mueven aquí para que el módulo sea autocontenido
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService],
})
export class PaymentMethodModule {}