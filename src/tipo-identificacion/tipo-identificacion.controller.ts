import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
// Las importaciones de arriba se mueven aquí para que el controlador sea autocontenido
import { TipoIdentificacionService } from './tipo-identificacion.service';
import { CreateTipoIdentificacionDto } from './dto/create-tipo-identificacion.dto';
import { UpdateTipoIdentificacionDto } from './dto/update-tipo-identificacion.dto';

@Controller('tipo-identificacion')
export class TipoIdentificacionController {
  constructor(private readonly service: TipoIdentificacionService) {}

  @Post()
  create(@Body() createDto: CreateTipoIdentificacionDto) {
    return this.service.create(createDto);
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
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateTipoIdentificacionDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}