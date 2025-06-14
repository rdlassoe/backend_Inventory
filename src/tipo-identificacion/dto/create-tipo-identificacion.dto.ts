import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateTipoIdentificacionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  readonly descripcion: string;
}