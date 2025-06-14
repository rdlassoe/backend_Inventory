import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, MinLength, IsOptional, IsIn } from 'class-validator';

// PartialType<T> crea una clase con las mismas propiedades que T, pero todas opcionales.
export class UpdateUserDto extends PartialType(CreateUserDto) {
  // A menudo, se quiere redefinir algunas propiedades para que tengan validadores
  // específicos para la actualización.

  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @IsOptional() // Hacemos la contraseña explícitamente opcional
  readonly password?: string;

  @IsString()
  @IsIn(['admin', 'vendedor', 'bodeguero'])
  @IsOptional()
  readonly role?: string;

  // Nota: No incluimos 'username' o 'persona_id' para evitar que se cambien
  // en una operación de actualización estándar, lo cual es más seguro.
  // Si se quisiera permitir, se añadirían aquí con @IsOptional().
}
