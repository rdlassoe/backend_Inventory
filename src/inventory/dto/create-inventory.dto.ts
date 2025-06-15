import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateInventoryDto {
  /**
   * El ID del producto para el cual se creará el registro de inventario.
   */
  @IsInt({ message: 'El ID del producto debe ser un número entero.' })
  @IsNotEmpty({ message: 'El ID del producto no puede estar vacío.' })
  readonly producto_id: number;

  /**
   * La cantidad inicial de stock. Es opcional y por defecto será 0.
   */
  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @Min(0, { message: 'La cantidad no puede ser un número negativo.' })
  @IsOptional()
  readonly cantidad?: number;
}
