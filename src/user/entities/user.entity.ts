import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
// Update the import path below if the actual location is different
import { Person } from '../../person/entities/person.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  iduser: number;

  @Column({ type: 'varchar', length: 45, unique: true, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 100, nullable: false, select: false }) // select: false evita que la contraseña se envíe en las consultas
  password: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  role: string; // Ej: 'admin', 'vendedor', 'bodeguero'

  // --- Relaciones ---

  @OneToOne(() => Person, { nullable: false, eager: true }) // eager: true carga los datos de la persona automáticamente
  @JoinColumn({ name: 'persona_id' })
  persona_id: Person;
}