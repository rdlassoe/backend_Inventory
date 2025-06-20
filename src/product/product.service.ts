import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoria_id, ...productData } = createProductDto;

    const category = await this.categoryRepository.findOneBy({ idcategoria: categoria_id });
    if (!category) {
      throw new NotFoundException(`Categoría con ID #${categoria_id} no encontrada.`);
    }

    const newProduct = this.productRepository.create({
      ...productData,
      categoria: category,
    });

    try {
      return await this.productRepository.save(newProduct);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Ya existe un producto con ese código.');
      }
      throw new InternalServerErrorException('Error al crear el producto.');
    }
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['categoria'] });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { idproduct: id },
      relations: ['categoria'],
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID #${id} no encontrado.`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const { categoria_id, ...productData } = updateProductDto;
    
    const product = await this.productRepository.preload({
      idproduct: id,
      ...productData
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID #${id} no encontrado.`);
    }
    
    if (categoria_id) {
        const category = await this.categoryRepository.findOneBy({idcategoria: categoria_id});
        if(!category) throw new NotFoundException(`Categoría con ID #${categoria_id} no encontrada.`);
        product.categoria = category;
    }

    try {
      return await this.productRepository.save(product);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Ya existe un producto con ese código.');
      }
      throw new InternalServerErrorException('Error al actualizar el producto.');
    }
  }

  async remove(id: number): Promise<Product> {
    const productToRemove = await this.findOne(id);
    await this.productRepository.remove(productToRemove);
    return productToRemove;
  }
  async buscarPorCodigoONombre(termino: string): Promise<Product[]> {
  return this.productRepository.find({
    where: [
      { codigo: ILike(`%${termino}%`) },
      { nombre: ILike(`%${termino}%`) },
    ],
    take: 10,
  });
}

}
