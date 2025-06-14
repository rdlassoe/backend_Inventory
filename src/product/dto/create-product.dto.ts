import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  readonly codigo: string;

  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsOptional()
  readonly descripcion?: string;

  @IsNumber()
  @IsPositive()
  readonly categoria_id: number;

  @IsNumber()
  @Min(0)
  readonly cantMinima: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  readonly costo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  readonly precio?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  readonly iva?: number;
}
