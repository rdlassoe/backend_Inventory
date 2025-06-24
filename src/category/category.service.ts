import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const newCategory = this.categoryRepository.create(createCategoryDto);
    try {
      return await this.categoryRepository.save(newCategory);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Ya existe una categoría con esa descripción.');
      }
      throw new InternalServerErrorException('Error al crear la categoría.');
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ idcategoria: id });
    if (!category) {
      throw new NotFoundException(`Categoría con ID #${id} no encontrada.`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id); // Reutilizamos findOne para verificar si existe
    this.categoryRepository.merge(category, updateCategoryDto);
    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Ya existe una categoría con esa descripción.');
      }
      throw new InternalServerErrorException('Error al actualizar la categoría.');
    }
  }

  async remove(id: number): Promise<Category> {
    const categoryToRemove = await this.findOne(id);
    await this.categoryRepository.remove(categoryToRemove);
    return categoryToRemove;
  }
}
