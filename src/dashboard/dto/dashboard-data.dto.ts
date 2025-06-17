// Estructura para un producto con bajo stock
class LowStockProductDto {
  id: number;
  nombre: string;
  cantidad: number;
  cantMinima: number;
}

// Estructura para un movimiento reciente
class RecentMovementDto {
  fecha: Date;
  producto: string;
  tipo: string;
  cantidad: number;
  usuario: string;
}

// NUEVA: Estructura para una venta reciente
class RecentSaleDto {
  idsale: number;
  fecha_hora: Date;
  cliente: string;
  total: number;
}

// NUEVA: Estructura para un producto top
class TopProductDto {
  nombre: string;
  totalVendido: number;
}
// NUEVA: Define la estructura de un producto sin stock.
class ZeroStockProductDto {
  id: number;
  nombre: string;
  cantidad: 0;
}
// DTO principal actualizado
export class DashboardDataDto {
  // --- Métricas existentes ---
  totalProductos: number;
  totalInventorio: number;
  ventasDia: number;
  ventasSemana: number;
  ventasMes: number;
  gananciaBruta: number;
  //netProfitNote: string;
  productoBajoStock: LowStockProductDto[];
  movimientosRecientes: RecentMovementDto[];
  ceroStockProducto: ZeroStockProductDto[];

  // --- NUEVAS FUNCIONES ---
  ventasRecientes: RecentSaleDto[];
  productosMasVendidos: TopProductDto[];
  //reportsNote: string;
}
