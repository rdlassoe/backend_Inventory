import { Controller, Get, Post, Body } from '@nestjs/common';
import { MovementInventoryService } from './movement-inventory.service';
import { CreateMovementDto } from './dto/create-movement-inventory.dto';

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
}