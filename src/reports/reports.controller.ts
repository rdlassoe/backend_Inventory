import { Controller, Get, Query, UseGuards, Res, ParseIntPipe, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto, } from './dto/report-query.dto';
import { ComparisonQueryDto } from './dto/comparison-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { Response } from 'express';

//@UseGuards(JwtAuthGuard, RolesGuard)
//@Roles('admin') // Solo los administradores pueden acceder a los reportes
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales/summary-by-period')
  getSalesSummaryByPeriod(@Query() query: ReportQueryDto) {
    return this.reportsService.getSalesSummaryByPeriod(query);
  }
  
  @Get('sales/top-products')
  getTopProductsSold(@Query() query: ReportQueryDto) {
    return this.reportsService.getTopProductsSold(query);
  }

  @Get('sales/by-category')
  getSalesByCategory(@Query() query: ReportQueryDto) {
    return this.reportsService.getSalesByCategory(query);
  }

  @Get('sales/by-client')
  getSalesByClient(@Query() query: ReportQueryDto) {
    return this.reportsService.getSalesByClient(query);
  }
  
  @Get('sales/comparison')
  getSalesComparison(@Query() query: ComparisonQueryDto) {
    return this.reportsService.getSalesComparison(query);
  }

    @Get('inventory/low-stock')
  getProductsWithLowStock() {
    return this.reportsService.getProductsWithLowStock();
  }
  
  @Get('inventory/valorized')
  getValorizedInventory() {
    return this.reportsService.getValorizedInventory();
  }

  @Get('inventory/movements')
  getInventoryMovements(@Query() query: ReportQueryDto) {
    return this.reportsService.getInventoryMovements(query);
  }

  @Get('inventory/kardex/:productId')
  getProductKardex(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: ReportQueryDto
  ) {
    return this.reportsService.getProductKardex(productId, query);
  }

  // --- NUEVO ENDPOINT PARA EL REPORTE GENERAL ---
  @Get('general-pdf')
  async getComprehensivePdfReport(@Query() query: ReportQueryDto, @Res() res: Response) {
      const pdfBuffer = await this.reportsService.generateComprehensivePdf(query);

      res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=reporte_general.pdf',
          'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
  }

 ///Get('stock-bajo-pdf')
  
  //ync downloadLowStockReport(@Res() res: Response) {
  //nst buffer = await this.reportsService.generateLowStockPdf();
  //s.end(buffer);
//
@Get('stock-bajo-pdf')
  async generateLowStockPdf(@Query() query: ReportQueryDto, @Res() res: Response) {
      const pdfBuffer = await this.reportsService.generateLowStockPdf();

      res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=reporte_general.pdf',
          'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
  }

}

