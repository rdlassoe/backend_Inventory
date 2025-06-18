import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto, } from './dto/report-query.dto';
import { ComparisonQueryDto } from './dto/comparison-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

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

  // ... (Tus otros endpoints de reportes de inventario y exportación)
}
