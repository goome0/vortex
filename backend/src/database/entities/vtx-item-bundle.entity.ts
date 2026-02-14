import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'vtx_item_bundles' })
export class VtxItemBundleEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  public name!: string;

  @Column({ type: 'text', nullable: true })
  public description!: string | null;

  @Column({ type: 'int', default: 0 })
  public cpCost!: number;

  // Products: { productId, quantity }[] or legacy number[] (qty 1 each)
  @Column({ type: 'simple-json' })
  public products!: number[] | { productId: number; quantity: number }[];

  @Index()
  @Column({ type: 'varchar', length: 32 })
  public createdByUsername!: string;

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  public updatedAt!: Date;
}

