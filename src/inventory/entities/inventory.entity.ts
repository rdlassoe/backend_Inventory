import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Product } from '../../product/entities/product.entity';


@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  idinventory: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  cantidad: number;

  @Column({ type: 'datetime', nullable: true })
  fecha_actualizacion: Date;

  // --- Relaciones ---
  // Un producto tiene una sola entrada de inventario.
  @OneToOne(() => Product, { nullable: false })
  @JoinColumn({ name: 'producto_id' })
  producto_id: Product;
}
