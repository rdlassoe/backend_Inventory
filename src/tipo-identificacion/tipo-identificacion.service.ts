import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Las importaciones de arriba se mueven aquí para que el servicio sea autocontenido
import { TipoIdentificacion } from './entities/tipo-identificacion.entity';
import { CreateTipoIdentificacionDto } from './dto/create-tipo-identificacion.dto';
import { UpdateTipoIdentificacionDto } from './dto/update-tipo-identificacion.dto';


@Injectable()
export class TipoIdentificacionService {
  constructor(
    @InjectRepository(TipoIdentificacion)
    private readonly tipoIdRepository: Repository<TipoIdentificacion>,
  ) {}

  async create(createDto: CreateTipoIdentificacionDto): Promise<TipoIdentificacion> {
    const newTipoId = this.tipoIdRepository.create(createDto);
    try {
      return await this.tipoIdRepository.save(newTipoId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`El tipo de identificación con descripción "${createDto.descripcion}" ya existe.`);
      }
      throw new InternalServerErrorException('Error al crear el tipo de identificación.');
    }
  }

  findAll(): Promise<TipoIdentificacion[]> {
    return this.tipoIdRepository.find();
  }

  async findOne(id: number): Promise<TipoIdentificacion> {
    const tipoId = await this.tipoIdRepository.findOneBy({ idtipo_identificacion: id });
    if (!tipoId) {
      throw new NotFoundException(`Tipo de identificación con ID #${id} no encontrado.`);
    }
    return tipoId;
  }

  async update(id: number, updateDto: UpdateTipoIdentificacionDto): Promise<TipoIdentificacion> {
    const tipoId = await this.findOne(id); // Reutiliza findOne para la validación de existencia
    this.tipoIdRepository.merge(tipoId, updateDto);
    try {
      return await this.tipoIdRepository.save(tipoId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(`El tipo de identificación con descripción "${updateDto.descripcion}" ya existe.`);
      }
      throw new InternalServerErrorException('Error al actualizar el tipo de identificación.');
    }
  }

  async remove(id: number): Promise<TipoIdentificacion> {
    const tipoIdToRemove = await this.findOne(id);
    // Aquí se podría añadir lógica para verificar si algún 'person' está usando este tipo de ID antes de borrar.
    await this.tipoIdRepository.remove(tipoIdToRemove);
    return tipoIdToRemove;
  }
}

