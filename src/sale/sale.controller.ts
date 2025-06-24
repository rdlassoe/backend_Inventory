import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, Header, Res } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Response } from 'express';

@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  /**
   * Endpoint para crear una nueva venta.
   * POST /sale
   */
  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  /**
   * Endpoint para obtener todas las ventas.
   * GET /sale
   */
  @Get()
  findAll() {
    return this.saleService.findAll();
  }

  /**
   * Endpoint para obtener una venta por su ID.
   * GET /sale/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.saleService.findOne(id);
  }

  /**
   * Endpoint para actualizar una venta existente por su ID.
   * PATCH /sale/:id
   */
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateSaleDto: UpdateSaleDto) {
    return this.saleService.update(id, updateSaleDto);
  }

  /**
   * Endpoint para eliminar una venta por su ID.
   * DELETE /sale/:id
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.saleService.remove(id);
  }

  @Get('factura/:id')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=factura.pdf')
  async downloadInvoice(@Param('id') id: number, @Res() res: Response) {
    const buffer = await this.saleService.generateInvoicePdf(+id);
    res.end(buffer);
  }
}
