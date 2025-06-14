import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Person } from '../person/entities/person.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  // ... create, findAll, findOne (como en la respuesta anterior) ...
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const person = await this.personRepository.findOneBy({ idperson: createUserDto.persona_id });
    if (!person) throw new NotFoundException(`La persona con ID #${createUserDto.persona_id} no fue encontrada.`);
    
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({ ...createUserDto, password: hashedPassword, persona_id: person });

    try {
      const savedUser = await this.userRepository.save(newUser);
      const { password, ...result } = savedUser;
      return result;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('El nombre de usuario o la persona ya tienen una cuenta asignada.');
      }
      throw new InternalServerErrorException('Ocurrió un error al crear el usuario.');
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find({ relations: ['persona_id'] });
    return users.map(user => { const { password, ...result } = user; return result; });
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { iduser: id }, relations: ['persona_id']});
    if (!user) throw new NotFoundException(`Usuario con ID #${id} no encontrado.`);
    const { password, ...result } = user;
    return result;
  }
  // Fin de los métodos anteriores

  /**
   * Actualiza un usuario (rol y/o contraseña).
   * @param id - ID del usuario a actualizar.
   * @param updateUserDto - Datos para actualizar.
   * @returns El usuario actualizado (sin la contraseña).
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    // Verificamos que se esté enviando al menos un dato para actualizar.
    if (Object.keys(updateUserDto).length === 0) {
        throw new BadRequestException('Se requiere al menos un campo para actualizar');
    }

    const userToUpdate = await this.userRepository.findOneBy({ iduser: id });
    if (!userToUpdate) {
      throw new NotFoundException(`Usuario con ID #${id} no encontrado.`);
    }

    // Creamos un nuevo objeto para los datos a actualizar.
    let updateData: any = { ...updateUserDto };

    // Si se envía una nueva contraseña, la hasheamos y la asignamos al nuevo objeto.
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Si se envía persona_id, convertirlo al objeto esperado por TypeORM
    if (updateUserDto.persona_id !== undefined) {
      const person = await this.personRepository.findOneBy({ idperson: updateUserDto.persona_id });
      if (!person) {
        throw new NotFoundException(`La persona con ID #${updateUserDto.persona_id} no fue encontrada.`);
      }
      updateData.persona_id = person;
    }

    // Mezclamos los datos actuales con los nuevos.
    const updatedUser = this.userRepository.merge(userToUpdate, updateData);

    try {
      await this.userRepository.save(updatedUser);
      // Devolvemos el usuario actualizado sin la contraseña
      const { password, ...result } = updatedUser;
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el usuario.');
    }
  }

  /**
   * Elimina un usuario.
   * @param id - ID del usuario a eliminar.
   * @returns El usuario que fue eliminado.
   */
  async remove(id: number): Promise<Omit<User, 'password'>> {
    const userToRemove = await this.userRepository.findOne({ 
        where: { iduser: id },
        // Cargamos la relación para poder devolver el objeto completo si es necesario.
        relations: ['persona_id']
    });

    if (!userToRemove) {
      throw new NotFoundException(`Usuario con ID #${id} no encontrado.`);
    }

    await this.userRepository.remove(userToRemove);
    
    // Devolvemos el objeto eliminado como confirmación (sin la contraseña).
    const { password, ...result } = userToRemove;
    return result;
  }
}
