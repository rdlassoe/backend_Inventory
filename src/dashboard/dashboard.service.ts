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
    // --- Llamadas a los métodos existentes ---
    const totalProducts = await this.getTotalProducts();
    const totalInventoryValue = await this.getTotalInventoryValue();
    const salesToday = await this.getSalesForPeriod('day');
    const salesThisWeek = await this.getSalesForPeriod('week');
    const salesThisMonth = await this.getSalesForPeriod('month');
    const grossProfitThisMonth = await this.getGrossProfitForMonth();

    // --- Llamadas a los NUEVOS métodos ---
    const lowStockProducts = await this.getLowStockProducts();
    const recentMovements = await this.getRecentMovements();
    const zeroStockProductCount = await this.getZeroStockProductCount();

    return {
      totalProducts,
      totalInventoryValue,
      salesToday,
      salesThisWeek,
      salesThisMonth,
      grossProfitThisMonth,
      netProfitNote: 'La ganancia neta requiere la contabilidad de gastos operativos (salarios, arriendo, etc.), datos no disponibles en este sistema.',
      lowStockProducts,
      recentMovements,
      zeroStockProductCount,
    };
  }
  
  // --- Métodos existentes (sin cambios) ---
  private async getTotalProducts(): Promise<number> {
    return this.dataSource.getRepository(Product).count();
  }
  private async getTotalInventoryValue(): Promise<number> {
    // Suma el valor total del inventario: cantidad * costo de cada producto
    const result = await this.dataSource.getRepository(Inventory)
      .createQueryBuilder('inventory')
      .innerJoin('inventory.producto_id', 'product')
      .select('SUM(inventory.cantidad * product.costo)', 'total')
      .getRawOne();
    return Number(result.total) || 0;
  }
  private async getSalesForPeriod(period: 'day' | 'week' | 'month'): Promise<number> {
    // Implementación temporal: devuelve 0 hasta que se agregue la lógica real
    return 0;
  }
  private async getGrossProfitForMonth(): Promise<number> {
    // TODO: Implementar la lógica real para calcular la ganancia bruta del mes
    return 0;
  }

  // ======== NUEVOS MÉTODOS PRIVADOS ========

  /**
   * Obtiene hasta 5 productos cuya cantidad actual es menor o igual a su cantidad mínima,
   * pero mayor que cero.
   */
  private async getLowStockProducts() {
    return this.dataSource.getRepository(Inventory)
      .createQueryBuilder('inventory')
      .innerJoin('inventory.producto_id', 'product')
      .select([
        'product.idproduct as id',
        'product.nombre as nombre',
        'inventory.cantidad as cantidad',
        'product.cantMinima as "cantMinima"',
      ])
      .where('inventory.cantidad <= product.cantMinima')
      .andWhere('inventory.cantidad > 0') // Excluimos los que están en cero
      .orderBy('inventory.cantidad', 'ASC')
      .limit(5)
      .getRawMany();
  }

  /**
   * Obtiene los últimos 5 movimientos de inventario registrados.
   */
  private async getRecentMovements() {
    return this.dataSource.getRepository(MovementInventory)
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
      .getRawMany();
  }

  /**
   * Cuenta cuántos productos tienen un stock exactamente igual a cero.
   */
  private async getZeroStockProductCount(): Promise<number> {
    return this.dataSource.getRepository(Inventory)
      .createQueryBuilder('inventory')
      .where('inventory.cantidad = 0')
      .getCount();
  }
}
