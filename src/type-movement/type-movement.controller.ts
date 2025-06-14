import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { TypeMovementService } from './type-movement.service';
import { CreateTypeMovementDto } from './dto/create-type-movement.dto';
import { UpdateTypeMovementDto } from './dto/update-type-movement.dto';

@Controller('type-movement')
export class TypeMovementController {
  constructor(private readonly service: TypeMovementService) {}
  @Post() create(@Body() dto: CreateTypeMovementDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTypeMovementDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}