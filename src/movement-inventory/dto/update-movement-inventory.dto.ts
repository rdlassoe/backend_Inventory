import { PartialType } from '@nestjs/swagger'; // o '@nestjs/mapped-types' si no usas swagger
import { CreateMovementDto } from './create-movement-inventory.dto';

export class UpdateMovementInventoryDto extends PartialType(CreateMovementDto) {
  fecha: any;
}
