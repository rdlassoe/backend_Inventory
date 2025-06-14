import { IsNumber, IsNotEmpty, IsInt, IsString, IsOptional, NotEquals } from 'class-validator';
import e from 'express';


export class CreateMovementDto {
  @IsInt()
  @IsNotEmpty()
  readonly producto_id: number;

  @IsInt()
  @IsNotEmpty()
  readonly movement_type_id: number;

  @IsInt()
  @IsNotEmpty()
  @NotEquals(0, { message: 'La cantidad no puede ser cero.'})
  // La cantidad será positiva para entradas y negativa para salidas.
  readonly cantidad: number;
  
  @IsString()
  @IsOptional()
  readonly descripcion?: string;

  @IsInt()
  @IsNotEmpty()
  readonly user_id: number;
} 