// src/sale/dto/create-sale-detail.dto.ts
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateSaleDetailDto {
  @IsInt({ message: 'El ID del producto debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID del producto no puede estar vacío.' })
  producto_id: number;

  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @Min(1, { message: 'La cantidad debe ser al menos 1.' })
  @IsNotEmpty({ message: 'La cantidad no puede estar vacía.' })
  cantidad: number;
}
