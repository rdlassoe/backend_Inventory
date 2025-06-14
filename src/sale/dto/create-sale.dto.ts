import { IsArray, IsInt, IsNotEmpty, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Clase interna para validar cada producto en el arreglo
class ProductDetailDto {
  @IsInt()
  @IsPositive()
  readonly producto_id: number;

  @IsInt()
  @IsPositive()
  readonly cantidad: number;
}

// DTO principal para la creación de una venta
export class CreateSaleDto {
  @IsInt()
  @IsPositive()
  readonly cliente_id: number;
  
  @IsInt()
  @IsPositive()
  readonly empleado_id: number;

  @IsInt()
  @IsPositive()
  readonly metodo_pago_id: number;
  
  @IsArray()
  @ValidateNested({ each: true }) // Valida cada objeto del arreglo
  @Type(() => ProductDetailDto)   // Especifica el tipo de objeto en el arreglo
  readonly productos: ProductDetailDto[];
}
