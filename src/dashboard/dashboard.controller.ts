import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DashboardDataDto } from './dto/dashboard-data.dto';

//@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos el controlador
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Devuelve un resumen de datos para el dashboard.
   * Accesible solo para roles 'admin' y 'vendedor'.
   */
  @Get()
  //@Roles('admin', 'vendedor')
  getDashboardData(): Promise<DashboardDataDto> {
    return this.dashboardService.getDashboardData();
  }
}
