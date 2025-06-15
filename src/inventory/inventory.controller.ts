import { Controller, Get, Param, Put, Body, ParseIntPipe, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {  UpdateInventoryDto } from './dto/update-inventory.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }
  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  // Ruta para obtener el inventario de un producto específico
  @Get('product/:productId')
  findOne(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.findOneByProductId(productId);
  }

  // Ruta para actualizar el inventario de un producto específico
  @Put('product/:productId')
  update(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateByProductId(productId, updateInventoryDto);
  }
}
