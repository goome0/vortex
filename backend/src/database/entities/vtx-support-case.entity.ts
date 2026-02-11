import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VtxSupportCaseMessageEntity } from './vtx-support-case-message.entity';

export enum EVtxCaseStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum EVtxCasePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity({ name: 'vtx_support_cases' })
export class VtxSupportCaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Index()
  @Column({ type: 'varchar', length: 32 })
  public createdByUsername!: string;

  @Index()
  @Column({ type: 'varchar', length: 32, nullable: true })
  public assignedToUsername!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 32, nullable: true })
  public resolvedByUsername!: string | null;

  @Column({ type: 'varchar', length: 140 })
  public subject!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  public category!: string | null;

  @Index()
  @Column({ type: 'enum', enum: EVtxCasePriority, default: EVtxCasePriority.MEDIUM })
  public priority!: EVtxCasePriority;

  @Index()
  @Column({ type: 'enum', enum: EVtxCaseStatus, default: EVtxCaseStatus.OPEN })
  public status!: EVtxCaseStatus;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  public resolvedAt!: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  public closedAt!: Date | null;

  @Index()
  @Column({ type: 'datetime', precision: 3 })
  public lastMessageAt!: Date;

  @OneToMany(() => VtxSupportCaseMessageEntity, (m) => m.supportCase)
  public messages!: VtxSupportCaseMessageEntity[];

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  public updatedAt!: Date;
}
