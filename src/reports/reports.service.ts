import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale } from '../sale/entities/sale.entity';
import { SaleDetail } from '../sale/entities/sale-detail.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
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
  ) {}

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

  // ... (Aquí irían los otros reportes de inventario y los métodos de exportación)
}
