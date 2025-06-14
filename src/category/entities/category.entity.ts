import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  idcategoria: number;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  descripcion_categoria: string;
}
