import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeMovement } from './entities/type-movement.entity';
import { UpdateTypeMovementDto } from './dto/update-type-movement.dto';
import { CreateTypeMovementDto } from './dto/create-type-movement.dto';

@Injectable()
export class TypeMovementService {
  constructor(
    @InjectRepository(TypeMovement)
    private readonly repo: Repository<TypeMovement>,
  ) {}

  create(dto: CreateTypeMovementDto) {
    return this.repo.save(dto).catch(err => {
        throw new ConflictException('La descripción ya existe.');
    });
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const type = await this.repo.findOneBy({ idtype_movement: id });
    if (!type) throw new NotFoundException(`Tipo de movimiento con ID #${id} no encontrado.`);
    return type;
  }
  
  async update(id: number, dto: UpdateTypeMovementDto) {
    const type = await this.findOne(id);
    this.repo.merge(type, dto);
    return this.repo.save(type).catch(err => {
        throw new ConflictException('La descripción ya existe.');
    });
  }

  async remove(id: number) {
    const type = await this.findOne(id);
    return this.repo.remove(type);
  }
}
