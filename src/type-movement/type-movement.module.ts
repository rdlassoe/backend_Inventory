import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeMovement } from './entities/type-movement.entity';
import { TypeMovementController } from './type-movement.controller';
import { TypeMovementService } from './type-movement.service';

@Module({
  imports: [TypeOrmModule.forFeature([TypeMovement])],
  controllers: [TypeMovementController],
  providers: [TypeMovementService],
})
export class TypeMovementModule {}