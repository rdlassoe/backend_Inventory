// Define la estructura de un producto con bajo stock para la respuesta.
class LowStockProductDto {
  id: number;
  nombre: string;
  cantidad: number;
  cantMinima: number;
}

// Define la estructura de un movimiento reciente para la respuesta.
class RecentMovementDto {
  fecha: Date;
  producto: string;
  tipo: string;
  cantidad: number;
  usuario: string;
}

// DTO principal actualizado con toda la información del dashboard.
export class DashboardDataDto {
  // --- Métricas existentes ---
  totalProducts: number;
  totalInventoryValue: number;
  salesToday: number;
  salesThisWeek: number;
  salesThisMonth: number;
  grossProfitThisMonth: number;
  netProfitNote: string;
  
  // --- Nuevas Métricas y Alertas ---
  lowStockProducts: LowStockProductDto[];
  recentMovements: RecentMovementDto[];
  zeroStockProductCount: number; // Será > 0 si hay productos en cero.
}
