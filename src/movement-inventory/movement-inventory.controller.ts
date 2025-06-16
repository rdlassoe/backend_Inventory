import { Controller, Get, Post, Body, Param, ParseIntPipe, Put, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { MovementInventoryService } from './movement-inventory.service';
import { CreateMovementDto } from './dto/create-movement-inventory.dto';
import { UpdateMovementInventoryDto } from './dto/update-movement-inventory.dto';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

//@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movement-inventory')
export class MovementInventoryController {
  constructor(private readonly service: MovementInventoryService) {}

  @Post()
  create(@Body() dto: CreateMovementDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  //@Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMovementInventoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  //@Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id); // Devuelve el objeto eliminado
  }
}