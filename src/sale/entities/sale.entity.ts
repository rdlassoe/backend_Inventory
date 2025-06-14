import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { PaymentMethod } from '../../payment-method/entities/payment-method.entity';
import { SaleDetail } from './../entities/sale-detail.entity';

@Entity('sale')
export class Sale {
  @PrimaryGeneratedColumn()
  idsale: number;

  @Column({ type: 'datetime', nullable: false })
  fecha_hora: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  total: number;

  // Relación con la persona que realiza la venta (empleado)
  @ManyToOne(() => Person, { nullable: false, eager: true })
  @JoinColumn({ name: 'empleado_id' })
  empleado: Person;

  // Relación con la persona que compra (cliente)
  @ManyToOne(() => Person, { nullable: false, eager: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Person;

  @ManyToOne(() => PaymentMethod, { nullable: false, eager: true })
  @JoinColumn({ name: 'metodo_pago_id' })
  metodo_pago: PaymentMethod;
  
  // Relación con los detalles de la venta
  @OneToMany(() => SaleDetail, detail => detail.venta, { cascade: true })
  detalles: SaleDetail[];
}
