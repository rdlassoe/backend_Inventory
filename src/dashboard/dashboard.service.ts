import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DashboardDataDto } from './dto/dashboard-data.dto';
import { Product } from '../product/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Sale } from '../sale/entities/sale.entity';
import { SaleDetail } from '../sale/entities/sale-detail.entity';
import { MovementInventory } from '../movement-inventory/entities/movement-inventory.entity';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async getDashboardData(): Promise<DashboardDataDto> {
    // Ejecutamos todas las consultas en paralelo para mayor eficiencia
    const [
      totalProductos,
      totalInventorio,
      ventasDia,
      ventasSemana,
      ventasMes,
      gananciaBruta,
      productoBajoStock,
      movimientosRecientes,
      ceroStockProducto,
      ventasRecientes,
      productosMasVendidos,
    ] = await Promise.all([
      this.getTotalProducts(),
      this.getTotalInventoryValue(),
      this.getSalesForPeriod('day'),
      this.getSalesForPeriod('week'),
      this.getSalesForPeriod('month'),
      this.getGrossProfitForMonth(),
      this.getLowStockProducts(),
      this.getRecentMovements(),
      this.getZeroStockProducts(),
      this.getRecentSales(),
      this.getTopSellingProducts(),
    ]);

    return {
      totalProductos,
      totalInventorio,
      ventasDia,
      ventasSemana,
      ventasMes,
      gananciaBruta,
      //netProfitNote: 'La ganancia neta requiere la contabilidad de gastos operativos (salarios, arriendo, etc.), datos no disponibles en este sistema.',
      productoBajoStock,
      movimientosRecientes,
      ceroStockProducto, // <-- CAMBIO: Ahora es un número, no un array
      ventasRecientes,
      productosMasVendidos,
      //reportsNote: 'Los enlaces a reportes detallados se pueden implementar en endpoints dedicados como /reports/daily.'
    };
  }

  // --- Métodos existentes (sin cambios) ---
  private async getTotalProducts(): Promise<number> { return this.dataSource.getRepository(Product).count(); }
  /**
   * Calcula el valor total del inventario (cantidad * costo).
   */
  private async getTotalInventoryValue(): Promise<number> { const result = await this.dataSource.getRepository(Inventory)
      .createQueryBuilder('inventory')
      .innerJoin('inventory.producto_id', 'product')
      .select('SUM(inventory.cantidad * product.costo)', 'totalValue')
      .getRawOne();
    
    return parseFloat(result.totalValue) || 0; }

  private async getSalesForPeriod(period: 'day' | 'week' | 'month'): Promise<number> { const now = new Date();
    let startDate: Date;

    if (period === 'day') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    } else { // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const result = await this.dataSource.getRepository(Sale)
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'totalSales')
      .where('sale.fecha_hora >= :startDate', { startDate })
      .getRawOne();
      
    return parseFloat(result.totalSales) || 0; }

    
  private async getGrossProfitForMonth(): Promise<number> { 
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await this.dataSource.getRepository(SaleDetail)
      .createQueryBuilder('detail')
      .innerJoin('detail.venta', 'sale')
      .innerJoin('detail.producto', 'product')
      .select('SUM(detail.cantidad * (detail.precio_unitario - product.costo))', 'grossProfit')
      .where('sale.fecha_hora >= :startDate', { startDate })
      .getRawOne();
      
    return parseFloat(result.grossProfit) || 0; }
  
  private async getLowStockProducts() { return this.dataSource.getRepository(Inventory)
      .createQueryBuilder('inventory')
      .innerJoin('inventory.producto_id', 'product')
      .select([
        'product.codigo as id',
        'product.nombre as nombre',
        'inventory.cantidad as cantidad',
        'product.cantMinima as "cantMinima"',
      ])
      .where('inventory.cantidad <= product.cantMinima')
      .andWhere('inventory.cantidad > 0')
      .orderBy('inventory.cantidad', 'ASC')
      .limit(5)
      .getRawMany();}
  private async getRecentMovements() { return this.dataSource.getRepository(MovementInventory)
      .createQueryBuilder('movement')
      .innerJoin('movement.inventario_id', 'inventory')
      .innerJoin('inventory.producto_id', 'product')
      .innerJoin('movement.movement_type_id', 'type')
      .innerJoin('movement.user_id', 'user')
      .select([
        'movement.fecha as fecha',
        'product.nombre as producto',
        'type.description as tipo',
        'movement.cantidad as cantidad',
        'user.username as usuario',
      ])
      .orderBy('movement.fecha', 'DESC')
      .limit(5)
      .getRawMany(); }

  private async getZeroStockProducts() {
    return this.dataSource.getRepository(Inventory)
      .createQueryBuilder('inventory')
      .innerJoin('inventory.producto_id', 'product')
      .select([
        'product.idproduct as id',
        'product.nombre as nombre',
        'inventory.cantidad as cantidad',
      ])
      .where('inventory.cantidad = 0')
      .getRawMany(); // <-- CAMBIO: Usamos getRawMany() en lugar de getCount()
  }


  // ======== NUEVOS MÉTODOS PRIVADOS ========

  /**
   * Obtiene las últimas 5 ventas registradas.
   */
  private async getRecentSales() {
    return this.dataSource.getRepository(Sale)
      .createQueryBuilder('sale')
      .innerJoin('sale.cliente', 'cliente')
      .select([
        'sale.idsale as idsale',
        'sale.fecha_hora as fecha_hora',
        "CONCAT(cliente.nombre, ' ', cliente.apellido) as cliente",
        'sale.total as total'
      ])
      .orderBy('sale.fecha_hora', 'DESC')
      .limit(5)
      .getRawMany();
  }

  /**
   * Obtiene los 5 productos más vendidos por cantidad total.
   */
  private async getTopSellingProducts() {
    return this.dataSource.getRepository(SaleDetail)
      .createQueryBuilder('detail')
      .innerJoin('detail.producto', 'product')
      .select('product.nombre', 'nombre')
      .addSelect('SUM(detail.cantidad)', 'totalVendido')
      .groupBy('product.nombre')
      .orderBy('totalVendido', 'DESC')
      .limit(5)
      .getRawMany();
  }
}
