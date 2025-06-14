import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'La cantidad no puede ser negativa.' })
  readonly cantidad: number;
}
