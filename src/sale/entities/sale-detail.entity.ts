import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('sale_detail')
export class SaleDetail {
  @PrimaryGeneratedColumn()
  idsale_detail: number;

  @Column({ type: 'int', nullable: false })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  precio_unitario: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: false })
  iva: number;
  
  @ManyToOne(() => Sale, sale => sale.detalles, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venta_id' })
  venta: Sale;

  @ManyToOne(() => Product, { nullable: false, eager: true })
  @JoinColumn({ name: 'producto_id' })
  producto: Product;
}
