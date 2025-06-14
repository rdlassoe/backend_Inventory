import { PartialType } from '@nestjs/swagger';
import { CreateMovementInventoryDto } from './create-movement-inventory.dto';

export class UpdateMovementInventoryDto extends PartialType(CreateMovementInventoryDto) {}
