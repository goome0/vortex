import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EVtxScheduledCpStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'vtx_scheduled_cp_grants' })
export class VtxScheduledCpGrantEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Index()
  @Column({ type: 'varchar', length: 32 })
  public username!: string;

  @Column({ type: 'int' })
  public amount!: number;

  @Column({ type: 'varchar', length: 140, nullable: true })
  public reason!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 32 })
  public createdByUsername!: string;

  @Index()
  @Column({ type: 'enum', enum: EVtxScheduledCpStatus, default: EVtxScheduledCpStatus.PENDING })
  public status!: EVtxScheduledCpStatus;

  @Index()
  @Column({ type: 'datetime', precision: 3 })
  public scheduledAt!: Date;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  public processedAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  public previousCp!: number | null;

  @Column({ type: 'int', nullable: true })
  public newCp!: number | null;

  @Column({ type: 'int', default: 0 })
  public attempts!: number;

  @Column({ type: 'text', nullable: true })
  public lastError!: string | null;

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  public updatedAt!: Date;
}

