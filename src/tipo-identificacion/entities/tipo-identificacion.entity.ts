import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_identificacion')
export class TipoIdentificacion {
  @PrimaryGeneratedColumn()
  idtipo_identificacion: number;

  @Column({ type: 'varchar', length: 25, unique: true, nullable: false })
  descripcion: string;
}