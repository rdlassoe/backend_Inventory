import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      relations: ['producto_id'], // Cargar datos del producto relacionado
    });
  }

  // Busca el inventario de un producto específico por el ID del PRODUCTO
  async findOneByProductId(productId: number): Promise<Inventory> {
    const inventoryItem = await this.inventoryRepository.findOne({
      where: { producto_id: { idproduct: productId } },
      relations: ['producto_id'],
    });

    if (!inventoryItem) {
      throw new NotFoundException(`No se encontró inventario para el producto con ID #${productId}.`);
    }
    return inventoryItem;
  }

  // Actualiza el inventario de un producto específico por el ID del PRODUCTO
  async updateByProductId(productId: number, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const inventoryItem = await this.findOneByProductId(productId); // Reutilizamos para buscar

    inventoryItem.cantidad = updateInventoryDto.cantidad;
    inventoryItem.fecha_actualizacion = new Date();

    return this.inventoryRepository.save(inventoryItem);
  }
}
