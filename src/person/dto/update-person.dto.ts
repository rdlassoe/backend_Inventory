import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonDto } from './create-person.dto';

// PartialType toma el DTO base (CreatePersonDto) y hace que todas sus propiedades
// sean opcionales. Esto es ideal para las operaciones de actualización, donde
// el cliente puede enviar solo los campos que desea cambiar.
export class UpdatePersonDto extends PartialType(CreatePersonDto) {}
