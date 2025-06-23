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
import * as PDFDocument from 'pdfkit';

// --- Constantes para el diseño ---
const BRAND_COLOR = '#023E8A';
const HEADER_COLOR = '#0077B6';
const TEXT_COLOR = '#495057';
const LIGHT_GRAY = '#F8F9FA'; // Un gris más claro
const ROW_HEIGHT = 25;
const PAGE_MARGIN = 30;
const PAGE_WIDTH = 612; // Ancho de página LETTER

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


  // --- Funciones de ayuda para DESCARGAR el PDF (Ahora más seguras) ---
  //         --- NUEVO ENDPOINT PARA EL REPORTE GENERAL ---
  async generateComprehensivePdf(query: ReportQueryDto): Promise<Buffer> {
    const [topProducts, lowStockProducts, salesByCategory] = await Promise.all([
      this.getTopProductsSold(query).catch(() => []),
      this.getProductsWithLowStock().catch(() => []),
      this.getSalesByCategory(query).catch(() => []),
    ]);

    const pdfBuffer: Buffer = await new Promise(resolve => {
      const doc = new PDFDocument({ size: 'LETTER', margin: PAGE_MARGIN, bufferPages: true });

      this.generateHeader(doc, 'Reporte General del Negocio');



      this.generateTable(doc, 'Productos con Bajo Nivel de Stock',
        [{ label: 'Producto', width: 300 }, { label: 'Stock Mínimo', width: 120, align: 'right' }, { label: 'Stock Actual', width: 120, align: 'right' }]
        ,
        lowStockProducts.map(p => [p?.producto_id?.nombre || 'N/A', p?.producto_id?.cantMinima || 0, p?.cantidad || 0])
      );

      this.generateTable(doc, 'Top Productos Más Vendidos',
        [{ label: 'Producto', width: 382 }, { label: 'Unidades Vendidas', width: 150, align: 'right' }],
        topProducts.map(p => [p.producto || 'N/A', p.unidadesVendidas || 0])
      );

      this.generateTable(doc, 'Resumen de Ventas por Categoría',
        [{ label: 'Categoría', width: 382 }, { label: 'Total Vendido', width: 150, align: 'right' }],
        salesByCategory.map(c => [c.categoria || 'N/A', `$${(parseFloat(c.valorTotal) || 0).toFixed(2)}`])
      );

      this.generateFooter(doc); // Dibuja el pie de página en todas las páginas existentes
      doc.end();

      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffer)));
    });
    return pdfBuffer;
  }

  // --- NUEVA FUNCIÓN GENÉRICA PARA CREAR TABLAS (CORREGIDA Y ROBUSTA) ---
  private generateTable(doc: PDFKit.PDFDocument, title: string, headers: { label: string, width: number, align?: 'left' | 'right' | 'center' }[], rows: (string | number)[][]) {
    const tableTopMargin = 30;
    // Si no hay espacio para el título y al menos una fila, añade una nueva página
    if (doc.y > doc.page.height - 150) doc.addPage();

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(14).fillColor(HEADER_COLOR).text(title, tableTopMargin);
    doc.moveDown();

    const tableStartY = doc.y;
    const startX = PAGE_MARGIN;

    // --- Dibuja el encabezado de la tabla ---
    doc.rect(startX, tableStartY, PAGE_WIDTH - startX * 2, ROW_HEIGHT).fill(LIGHT_GRAY);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_COLOR);

    let currentX = startX;
    headers.forEach(header => {
      doc.text(header.label, currentX + 5, tableStartY + 7, { width: header.width - 10, align: header.align || 'left' });
      currentX += header.width;
    });

    // --- Dibuja las filas de la tabla ---
    doc.font('Helvetica').fontSize(9);
    let currentY = tableStartY + ROW_HEIGHT;

    if (!rows || rows.length === 0) {
      doc.fillColor(TEXT_COLOR).text("No hay datos para mostrar.", startX + 5, currentY + 7, { width: PAGE_WIDTH - startX * 2 - 10, align: 'center' });
      doc.y = currentY + ROW_HEIGHT;
      return;
    }

    rows.forEach((row, rowIndex) => {
      // Si la fila va a salirse de la página, crea una nueva y redibuja el encabezado
      if (currentY + ROW_HEIGHT > doc.page.height - PAGE_MARGIN) {
        doc.addPage();
        currentY = doc.page.margins.top;

        doc.rect(startX, currentY, PAGE_WIDTH - startX * 2, ROW_HEIGHT).fill(LIGHT_GRAY);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND_COLOR);
        let headerX = startX;
        headers.forEach(header => {
          doc.text(header.label, headerX + 5, currentY + 7, { width: header.width - 10, align: header.align || 'left' });
          headerX += header.width;
        });
        currentY += ROW_HEIGHT;
        doc.font('Helvetica').fontSize(9);
      }

      // Dibuja el fondo para filas alternas (zebra)
      if (rowIndex % 2 !== 0) doc.rect(startX, currentY, PAGE_WIDTH - startX * 2, ROW_HEIGHT).fill(LIGHT_GRAY).stroke();

      currentX = startX;
      row.forEach((cell, cellIndex) => {
        doc.fillColor(TEXT_COLOR).text(String(cell), currentX + 5, currentY + 7, { width: headers[cellIndex].width - 10, align: headers[cellIndex].align || 'left' });
        currentX += headers[cellIndex].width;
      });
      currentY += ROW_HEIGHT;
    });

    doc.y = currentY; // Actualiza la posición Y global después de dibujar la tabla.
  }

  // --- Funciones de Header y Footer (CORREGIDAS) ---
  private generateHeader(doc: PDFKit.PDFDocument, title: string) {
    // Dibuja el encabezado en la posición actual de la página
    doc.fillColor(BRAND_COLOR).fontSize(20).font('Helvetica-Bold').text('Ferretería "Ferrelectricos Putumayo"', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text(title, { align: 'center' }).moveDown();
  }

  private generateFooter(doc: PDFKit.PDFDocument) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);

      const pageBottom = doc.page.height - PAGE_MARGIN;
      const now = new Date();
      const formattedDate = now.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const leftText = `Reporte generado el ${formattedDate}`;
      const rightText = `Página ${i + 1} de ${pageCount}`;

      // Dibujar línea horizontal
      doc.moveTo(PAGE_MARGIN, pageBottom)
        .lineTo(doc.page.width - PAGE_MARGIN, pageBottom)
        .strokeColor(LIGHT_GRAY)
        .stroke();

      // Configurar estilo de texto
      doc.fontSize(8).fillColor('gray');

      // Imprimir texto izquierdo
      doc.text(leftText, PAGE_MARGIN, pageBottom + 5, {
        lineBreak: false,
      });

      // Calcular ancho del texto derecho
      const rightTextWidth = doc.widthOfString(rightText);

      // Imprimir texto derecho en la misma línea
      doc.text(
        rightText,
        doc.page.width - PAGE_MARGIN - rightTextWidth,
        pageBottom + 5,
        { lineBreak: false }
      );
    }
  }

}
