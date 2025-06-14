import { IsString, IsNotEmpty, MinLength, IsIn, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['admin', 'vendedor', 'bodeguero']) // Define los roles permitidos
  readonly role: string;

  @IsInt()
  @IsNotEmpty()
  readonly persona_id: number; // Recibimos el ID de la persona a la que se le asignará el usuario
}
