import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EVtxItemBundleSendStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'vtx_item_bundle_send_batches' })
export class VtxItemBundleSendBatchEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Index()
  @Column({ type: 'uuid' })
  public bundleId!: string;

  // Store snapshot so scheduled sends are stable even if bundle changes later.
  @Column({ type: 'varchar', length: 64 })
  public bundleName!: string;

  @Column({ type: 'int', default: 0 })
  public cpCost!: number;

  @Column({ type: 'simple-json' })
  public products!: number[] | { productId: number; quantity: number }[];

  @Column({ type: 'varchar', length: 140, nullable: true })
  public reason!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 32 })
  public createdByUsername!: string;

  @Index()
  @Column({ type: 'enum', enum: EVtxItemBundleSendStatus, default: EVtxItemBundleSendStatus.PENDING })
  public status!: EVtxItemBundleSendStatus;

  @Index()
  @Column({ type: 'datetime', precision: 3 })
  public scheduledAt!: Date;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  public completedAt!: Date | null;

  @Column({ type: 'int', default: 0 })
  public totalRecipients!: number;

  @Column({ type: 'int', default: 0 })
  public processedCount!: number;

  @Column({ type: 'int', default: 0 })
  public successCount!: number;

  @Column({ type: 'int', default: 0 })
  public failureCount!: number;

  @Column({ type: 'text', nullable: true })
  public lastError!: string | null;

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  public updatedAt!: Date;
}

