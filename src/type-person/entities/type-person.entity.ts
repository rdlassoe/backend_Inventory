
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('type_person')
export class TypePerson {
  @PrimaryGeneratedColumn()
  idtype_person: number;

  @Column({ type: 'varchar', length: 25, unique: true, nullable: false })
  descripcion: string;
}