import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypePerson } from './entities/type-person.entity';
import { CreateTypePersonDto } from './dto/create-type-person.dto';
import { UpdateTypePersonDto } from './dto/update-type-person.dto';

@Injectable()
export class TypePersonService {
  constructor(
    @InjectRepository(TypePerson)
    private readonly typePersonRepository: Repository<TypePerson>,
  ) {}

  async create(createDto: CreateTypePersonDto): Promise<TypePerson> {
    const newTypePerson = this.typePersonRepository.create(createDto);
    try {
      return await this.typePersonRepository.save(newTypePerson);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`El tipo de persona con descripción "${createDto.descripcion}" ya existe.`);
      }
      throw new InternalServerErrorException('Error al crear el tipo de persona.');
    }
  }

  findAll(): Promise<TypePerson[]> {
    return this.typePersonRepository.find();
  }

  async findOne(id: number): Promise<TypePerson> {
    const typePerson = await this.typePersonRepository.findOneBy({ idtype_person: id });
    if (!typePerson) {
      throw new NotFoundException(`Tipo de persona con ID #${id} no encontrado.`);
    }
    return typePerson;
  }

  async update(id: number, updateDto: UpdateTypePersonDto): Promise<TypePerson> {
    const typePerson = await this.findOne(id);
    this.typePersonRepository.merge(typePerson, updateDto);
    try {
      return await this.typePersonRepository.save(typePerson);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`El tipo de persona con descripción "${updateDto.descripcion}" ya existe.`);
      }
      throw new InternalServerErrorException('Error al actualizar el tipo de persona.');
    }
  }

  async remove(id: number): Promise<TypePerson> {
    const typePersonToRemove = await this.findOne(id);
    await this.typePersonRepository.remove(typePersonToRemove);
    return typePersonToRemove;
  }
}