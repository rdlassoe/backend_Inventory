import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// Importaremos UpdateUserDto cuando lo creemos
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Endpoint para crear un nuevo usuario.
   * POST /user
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * Endpoint para obtener todos los usuarios.
   * GET /user
   */
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /**
   * Endpoint para obtener un usuario por su ID.
   * GET /user/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe valida que el 'id' sea un número entero.
    return this.userService.findOne(id);
  }

  
    // Los endpoints para actualizar y eliminar se verían así:

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
      return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.userService.remove(id);
    }

}
