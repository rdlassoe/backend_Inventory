import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
  IsNumber,
} from 'class-validator';

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  readonly apellido: string;
  
  @IsNumber()
  @IsNotEmpty()
  readonly tipo_id: number; // Se espera el ID del tipo de identificación

  @IsString()
  @IsNotEmpty()
  readonly numero_identificacion: string;

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  readonly movil?: string;
  
  @IsNumber()
  @IsNotEmpty()
  readonly tipo_personaid: number; // Se espera el ID del tipo de persona (cliente, empleado, etc.)
}
