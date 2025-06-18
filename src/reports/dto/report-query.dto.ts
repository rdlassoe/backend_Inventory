import { IsOptional, IsDateString, IsInt, IsPositive, IsString, IsIn } from 'class-validator';

import { Transform } from 'class-transformer';

export class ReportQueryDto {
  /**
   * Fecha de inicio para el filtro del reporte (formato YYYY-MM-DD).
   */
  @IsDateString()
  @IsOptional()
  readonly startDate?: string;

  /**
   * Fecha de fin para el filtro del reporte (formato YYYY-MM-DD).
   */
  @IsDateString()
  @IsOptional()
  readonly endDate?: string;

  /**
   * ID de un cliente específico para filtrar las ventas.
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => parseInt(value)) // Transforma el string del query a número
  readonly clientId?: number;

  /**
   * ID de un empleado específico para filtrar las ventas.
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  readonly employeeId?: number;

  /**
   * Límite para reportes tipo "Top N".
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  readonly limit?: number;
  
  /**
   * Formato de exportación deseado ('pdf' o 'excel').
   */
  @IsString()
  @IsOptional()
  readonly format?: string = 'json'; // Por defecto devuelve JSON si no se especifica

  /**
   * Periodo para agrupar el reporte de ventas ('day', 'week', 'month', 'year').
   */
  @IsString()
  @IsIn(['day', 'week', 'month', 'year'])
  @IsOptional()
  readonly period?: 'day' | 'week' | 'month' | 'year';
}
