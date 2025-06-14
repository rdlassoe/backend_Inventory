import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('payment_method')
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  idpayment_method: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  description: string;
}