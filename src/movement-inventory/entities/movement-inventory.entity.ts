import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { TypeMovement } from '../../type-movement/entities/type-movement.entity';
import { User } from '../../user/entities/user.entity';

@Entity('movement_inventory')
export class MovementInventory {
  @PrimaryGeneratedColumn()
  idmovement_inventory: number;

  @Column({ type: 'datetime' })
  fecha: Date;

  @Column({ type: 'int' })
  cantidad: number;

  // Asegúrate de que esta propiedad exista en tu archivo
  @Column({ type: 'varchar', length: 100, nullable: true })
  descripcion: string;
  
  // --- Relaciones ---
  @ManyToOne(() => Inventory, { nullable: false })
  @JoinColumn({ name: 'inventario_id' })
  inventario_id: Inventory;

  @ManyToOne(() => TypeMovement, { nullable: false, eager: true })
  @JoinColumn({ name: 'movement_type_id' })
  movement_type_id: TypeMovement;

  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  user_id: User;
}
