import { PartialType } from '@nestjs/mapped-types';
import { CreateTypePersonDto } from './create-type-person.dto';

export class UpdateTypePersonDto extends PartialType(CreateTypePersonDto) {}

