import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// Update the import path if the Category entity is located elsewhere
import { Category } from '../../category/entities/category.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  idproduct: number;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  codigo: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  descripcion: string;

  @Column({ type: 'int', nullable: false })
  cantMinima: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costo: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  iva: number;

  // --- Relaciones ---
  @ManyToOne(() => Category, { nullable: false, eager: true }) // eager:true para cargar la categoría siempre
  @JoinColumn({ name: 'categoria_id' })
  categoria: Category;
}
