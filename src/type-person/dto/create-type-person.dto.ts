import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateTypePersonDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  readonly descripcion: string;
}