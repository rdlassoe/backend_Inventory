import { Controller, Get, Param, Put, Body, ParseIntPipe, Post, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }
  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  // Ruta para obtener el inventario de un producto específico
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) productId: number) {
    return this.inventoryService.findOneByProductId(productId);
  }

  // Ruta para actualizar el inventario de un producto específico
  @Put('by-codigo/:codigo')
  updateByCodigo(
    @Param('codigo') codigo: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateByProductCode(codigo, updateInventoryDto);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) productId: number) {
    return this.inventoryService.removeByProductId(productId);
  }

}
