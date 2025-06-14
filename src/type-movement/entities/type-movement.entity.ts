import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('type_movement')
export class TypeMovement {
  @PrimaryGeneratedColumn()
  idtype_movement: number;

  @Column({ type: 'varchar', length: 45, nullable: false, unique: true })
  description: string;
}
