import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @MinLength(3, { message: 'La descripción debe tener al menos 3 caracteres.' })
  readonly description: string;
}