import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale } from '../sale/entities/sale.entity';
import { SaleDetail } from '../sale/entities/sale-detail.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../product/entities/product.entity';
import { MovementInventory } from '../movement-inventory/entities/movement-inventory.entity';
import { ComparisonQueryDto } from './dto/comparison-query.dto';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleDetail)
    private readonly saleDetailRepository: Repository<SaleDetail>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(MovementInventory)
    private readonly movementRepository: Repository<MovementInventory>, // Esta dependencia causaba el error
  ) { }



  /**
   * 1. Reporte de Ventas por Periodo (Día, Semana, Mes, Año)
   */
  async getSalesSummaryByPeriod(query: ReportQueryDto) {
    const { period, startDate, endDate } = query;

    // Define el formato de fecha para agrupar según el periodo solicitado
    let dateFormat: string;
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-%u'; // %u = Semana del año (Lunes como primer día)
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default: // Si no se especifica, se calcula el total del rango de fechas
        if (!startDate || !endDate) {
          throw new BadRequestException(
            'startDate y endDate son requeridos cuando no se especifica un periodo.',
          );
        }
        const totalResult = await this.saleRepository.createQueryBuilder('sale')
          .select('SUM(sale.total)', 'valorTotal')
          .addSelect('COUNT(sale.idsale)', 'numeroTransacciones')
          .where({ fecha_hora: Between(new Date(startDate), new Date(endDate)) })
          .getRawOne();
        return totalResult;
    }

    const qb = this.saleRepository.createQueryBuilder('sale')
      .leftJoin('sale.detalles', 'detail')
      .select(`DATE_FORMAT(sale.fecha_hora, "${dateFormat}")`, 'periodo')
      .addSelect('SUM(sale.total)', 'valorTotal')
      .addSelect('COUNT(DISTINCT sale.idsale)', 'numeroTransacciones')
      .addSelect('SUM(detail.cantidad)', 'productosVendidos')
      .groupBy('periodo')
      .orderBy('periodo', 'ASC');

    if (startDate && endDate) {
      qb.where('sale.fecha_hora BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return qb.getRawMany();
  }

  /**
   * 2. Top Productos Más Vendidos
   */
  async getTopProductsSold(query: ReportQueryDto) {
    const limit = query.limit || 10;

    return this.saleDetailRepository.createQueryBuilder('detail')
      .select('product.nombre', 'producto')
      .addSelect('SUM(detail.cantidad)', 'unidadesVendidas')
      .innerJoin('detail.producto', 'product')
      .groupBy('product.idproduct')
      .orderBy('unidadesVendidas', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  /**
   * 3. Ventas por Categoría
   */
  async getSalesByCategory(query: ReportQueryDto) {
    const qb = this.saleDetailRepository.createQueryBuilder('detail')
      .innerJoin('detail.producto', 'product')
      .innerJoin('product.categoria', 'category')
      .select('category.descripcion_categoria', 'categoria')
      .addSelect('SUM(detail.cantidad * detail.precio_unitario)', 'valorTotal')
      .groupBy('category.idcategoria')
      .orderBy('valorTotal', 'DESC');

    if (query.startDate && query.endDate) {
      qb.innerJoin('detail.venta', 'sale')
        .where('sale.fecha_hora BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate
        });
    }

    return qb.getRawMany();
  }

  /**
   * 4. Ventas por Cliente (Clientes Frecuentes)
   */
  async getSalesByClient(query: ReportQueryDto) {
    const limit = query.limit || 10;

    return this.saleRepository.createQueryBuilder('sale')
      .innerJoin('sale.cliente', 'cliente')
      .select('CONCAT(cliente.nombre, " ", cliente.apellido)', 'cliente')
      .addSelect('SUM(sale.total)', 'valorTotalCompras')
      .addSelect('COUNT(sale.idsale)', 'numeroDeCompras')
      .groupBy('sale.cliente')
      .orderBy('valorTotalCompras', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  /**
   * 5. Comparativa de Ventas entre dos Periodos
   */
  async getSalesComparison(query: ComparisonQueryDto) {
    const { startDate1, endDate1, startDate2, endDate2 } = query;

    const calculateTotal = async (start: string, end: string) => {
      const result = await this.saleRepository.createQueryBuilder('sale')
        .select('SUM(sale.total)', 'total')
        .where('sale.fecha_hora BETWEEN :start AND :end', { start, end })
        .getRawOne();
      return parseFloat(result.total) || 0;
    };

    const [totalPeriodo1, totalPeriodo2] = await Promise.all([
      calculateTotal(startDate1, endDate1),
      calculateTotal(startDate2, endDate2)
    ]);

    return {
      periodo1: {
        fechas: `${startDate1} al ${endDate1}`,
        totalVendido: totalPeriodo1
      },
      periodo2: {
        fechas: `${startDate2} al ${endDate2}`,
        totalVendido: totalPeriodo2
      }
    };
  }
  // ==================================================
  // ---         REPORTES DE INVENTARIO           ---
  // ==================================================

  /**
   * 1. Productos Bajo Stock Mínimo
   */
  async getProductsWithLowStock() {
    return this.inventoryRepository.createQueryBuilder('inventory')
      .innerJoinAndSelect('inventory.producto_id', 'product')
      .where('inventory.cantidad <= product.cantMinima')
      .orderBy('inventory.cantidad', 'ASC')
      .getMany();
  }

  /**
   * 2. Inventario Valorizado
   */
  async getValorizedInventory() {
    const result = await this.inventoryRepository.createQueryBuilder('inventory')
      .select('SUM(inventory.cantidad * product.costo)', 'totalCosto')
      .addSelect('SUM(inventory.cantidad * product.precio)', 'totalPrecioVenta')
      .innerJoin('inventory.producto_id', 'product')
      .getRawOne();

    return {
      valorTotalInventarioACosto: parseFloat(result.totalCosto) || 0,
      valorPotencialVenta: parseFloat(result.totalPrecioVenta) || 0
    };
  }

  /**
   * 3. Historial de Movimientos de Inventario
   */
  async getInventoryMovements(query: ReportQueryDto) {
    const qb = this.movementRepository.createQueryBuilder('movement')
      // Unimos las tablas relacionadas para poder acceder a sus datos
      .innerJoin('movement.inventario_id', 'inventory')
      .innerJoin('inventory.producto_id', 'product')
      .innerJoin('movement.movement_type_id', 'type')
      .innerJoin('movement.user_id', 'user')
      .innerJoin('user.persona_id', 'person')
      // Seleccionamos explícitamente los campos que queremos mostrar para un reporte limpio
      .select([
        'movement.idmovement_inventory AS id',
        'movement.fecha AS fecha',
        'movement.descripcion AS descripcion',
        'product.nombre AS producto',
        'movement.cantidad AS cantidad',
        'type.description AS tipoDeMovimiento',
        'CONCAT(person.nombre, " ", person.apellido) AS usuario'
      ])
      .orderBy('movement.fecha', 'DESC');

    if (query.startDate && query.endDate) {
      qb.where('movement.fecha BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate
      });
    }

    return qb.getRawMany(); // getRawMany devuelve un resultado plano y limpio
  }

  /**
   * Reporte de Kardex de un Producto (Corregido)
   * Muestra el historial de movimientos y el cálculo de existencias para un solo producto.
   */
  async getProductKardex(productId: number, query: ReportQueryDto) {
    const product = await this.productRepository.findOneBy({ idproduct: productId });
    if (!product) {
      throw new NotFoundException(`Producto con ID #${productId} no encontrado.`);
    }

    // --- CORRECCIÓN CLAVE ---
    // La consulta ahora une explícitamente el producto y filtra por su ID.
    const baseQuery = this.movementRepository.createQueryBuilder('movement')
      .innerJoin('movement.inventario_id', 'inventory')
      .innerJoin('inventory.producto_id', 'product')
      .where('product.idproduct = :productId', { productId });

    // Clonamos la consulta base para los diferentes cálculos
    const movementsQuery = baseQuery.clone()
      .select(['movement.fecha', 'movement.descripcion', 'movement.cantidad'])
      .orderBy('movement.fecha', 'ASC')
      .addOrderBy('movement.idmovement_inventory', 'ASC');

    if (query.startDate && query.endDate) {
      movementsQuery.andWhere('movement.fecha BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

    const movements = await movementsQuery.getRawMany();

    // Calcular el stock inicial (total de movimientos antes de la fecha de inicio del reporte)
    let stockInicial = 0;
    if (query.startDate) {
      const initialStockQuery = baseQuery.clone()
        .andWhere('movement.fecha < :startDate', { startDate: query.startDate })
        .select('SUM(movement.cantidad)', 'total');

      const initialStockResult = await initialStockQuery.getRawOne();
      stockInicial = parseFloat(initialStockResult.total) || 0;
    }

    // Calcular las existencias después de cada movimiento
    let existencias = stockInicial;
    const kardexMovimientos = movements.map(mov => {
      existencias += mov.cantidad;
      return {
        fecha: mov.fecha,
        descripcion: mov.descripcion,
        entrada: mov.cantidad > 0 ? mov.cantidad : 0,
        salida: mov.cantidad < 0 ? Math.abs(mov.cantidad) : 0,
        existencias: existencias,
      };
    });

    return {
      producto: {
        id: product.idproduct,
        nombre: product.nombre,
        codigo: product.codigo
      },
      stockInicial,
      movimientos: kardexMovimientos
    };
  }
}
