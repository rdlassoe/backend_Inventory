import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { TipoIdentificacion } from '../../tipo-identificacion/entities/tipo-identificacion.entity'; // Suponiendo que crearás esta entidad
import { TypePerson } from '../../type-person/entities/type-person.entity'; // Suponiendo que crearás esta entidad
// TODO: Update the import path below if 'user.entity.ts' is located elsewhere
import { User } from '../../user/entities/user.entity'; // Ajusta la ruta según la ubicación real del archivo

@Entity('person')
export class Person {
  @PrimaryGeneratedColumn()
  idperson: number;

  @Column({ type: 'varchar', length: 45, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 45, nullable: false })
  apellido: string;

  @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
  numero_identificacion: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  movil: string;

  // --- Relaciones ---

  @ManyToOne(() => TipoIdentificacion, { nullable: true, eager: true }) // eager: true carga la relación automáticamente
  @JoinColumn({ name: 'tipo_id' })
  tipo_id: TipoIdentificacion;

  @ManyToOne(() => TypePerson, { nullable: true, eager: true })
  @JoinColumn({ name: 'tipo_personaid' })
  tipo_personaid: TypePerson;

  @OneToOne(() => User, (user) => user.persona_id)
  user: User;
}

