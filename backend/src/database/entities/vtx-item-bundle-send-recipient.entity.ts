import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum EVtxItemBundleRecipientStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'vtx_item_bundle_send_recipients' })
export class VtxItemBundleSendRecipientEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Index()
  @Column({ type: 'uuid' })
  public batchId!: string;

  @Index()
  @Column({ type: 'varchar', length: 32 })
  public username!: string;

  @Index()
  @Column({ type: 'enum', enum: EVtxItemBundleRecipientStatus, default: EVtxItemBundleRecipientStatus.PENDING })
  public status!: EVtxItemBundleRecipientStatus;

  @Column({ type: 'int', default: 0 })
  public attempts!: number;

  @Column({ type: 'text', nullable: true })
  public lastError!: string | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  public sentAt!: Date | null;

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  public createdAt!: Date;
}

