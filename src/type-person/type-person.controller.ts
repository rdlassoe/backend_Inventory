import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { TypePersonService } from './type-person.service';
import { CreateTypePersonDto } from './dto/create-type-person.dto';
import { UpdateTypePersonDto } from './dto/update-type-person.dto';

@Controller('type-person')
export class TypePersonController {
  constructor(private readonly service: TypePersonService) {}

  @Post()
  create(@Body() createDto: CreateTypePersonDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateTypePersonDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
