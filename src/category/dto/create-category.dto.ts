import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  readonly descripcion_categoria: string;
}