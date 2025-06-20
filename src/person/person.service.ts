import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) { }

  /**
   * Crea un nuevo registro de persona en la base de datos.
   * @param createPersonDto - Datos para la nueva persona.
   * @returns La entidad de la persona creada.
   */
  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    try {
      // Creamos una nueva instancia de la entidad Persona con los datos del DTO.
      // TypeORM se encarga de mapear los IDs a las relaciones correspondientes.
      const newPerson = this.personRepository.create({
        ...createPersonDto,
        tipo_id: { idtipo_identificacion: createPersonDto.tipo_id } as any,
        tipo_personaid: { idtype_person: createPersonDto.tipo_personaid } as any,
      });
      // Guardamos la nueva persona en la base de datos.
      return await this.personRepository.save(newPerson);
    } catch (error) {
      // Manejo de errores (por ejemplo, una identificación duplicada)
      throw new InternalServerErrorException('Error al crear la persona. Verifique los datos e intente de nuevo.');
    }
  }

  /**
   * Obtiene todos los registros de personas.
   * @returns Un arreglo de todas las personas.
   */
  async findAll(): Promise<Person[]> {
    return this.personRepository.find({
      // Cargamos las relaciones para que se muestren en la respuesta.
      relations: ['tipo_id', 'tipo_personaid']
    });
  }

  /**
   * Busca y devuelve una persona por su ID.
   * @param id - El ID de la persona a buscar.
   * @returns La entidad de la persona encontrada.
   */
  async findOne(id: number): Promise<Person> {
    const person = await this.personRepository.findOne({
      where: { idperson: id },
      relations: ['tipo_id', 'tipo_personaid']
    });
    // Si la persona no se encuentra, lanzamos una excepción.
    if (!person) {
      throw new NotFoundException(`Persona con ID #${id} no encontrada.`);
    }
    return person;
  }

  /**
   * Actualiza los datos de una persona existente.
   * @param id - El ID de la persona a actualizar.
   * @param updatePersonDto - Los datos a actualizar.
   * @returns La entidad de la persona actualizada.
   */
  async update(id: number, updatePersonDto: UpdatePersonDto): Promise<Person> {
    const person = await this.personRepository.preload({
      idperson: id,
      ...updatePersonDto,
      ...(updatePersonDto.tipo_id && { tipo_id: { idtipo_identificacion: updatePersonDto.tipo_id } as any }),
      ...(updatePersonDto.tipo_personaid && { tipo_personaid: { idtype_person: updatePersonDto.tipo_personaid } as any }),
    });

    if (!person) {
      throw new NotFoundException(`No se pudo actualizar. Persona con ID #${id} no encontrada.`);
    }

    try {
      return await this.personRepository.save(person);
    } catch (error) {
      // Este manejo de error es genérico.
      throw new InternalServerErrorException('Error al actualizar la persona.');
    }
  }

  /**
   * Elimina una persona de la base de datos.
   * @param id - El ID de la persona a eliminar.
   * @returns El objeto de la persona que fue eliminada.
   */
  async remove(id: number): Promise<Person> {
    // Primero, buscamos la persona para asegurarnos de que existe.
    const personToRemove = await this.findOne(id);

    // Si findOne no la encuentra, ya habrá lanzado un NotFoundException.
    // Usamos 'remove' para eliminar la entidad.
    await this.personRepository.remove(personToRemove);

    // Devolvemos el objeto eliminado como confirmación.
    return personToRemove;
  }
}
