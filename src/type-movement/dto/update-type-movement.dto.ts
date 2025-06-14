import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeMovementDto } from './create-type-movement.dto';

export class UpdateTypeMovementDto extends PartialType(CreateTypeMovementDto) {}
