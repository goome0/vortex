import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VtxSupportTicketMessageEntity } from './vtx-support-ticket-message.entity';

export enum EVtxTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum EVtxTicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity({ name: 'vtx_support_tickets' })
export class VtxSupportTicketEntity {
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
  @Column({ type: 'enum', enum: EVtxTicketPriority, default: EVtxTicketPriority.MEDIUM })
  public priority!: EVtxTicketPriority;

  @Index()
  @Column({ type: 'enum', enum: EVtxTicketStatus, default: EVtxTicketStatus.OPEN })
  public status!: EVtxTicketStatus;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  public resolvedAt!: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  public closedAt!: Date | null;

  @Index()
  @Column({ type: 'datetime', precision: 3 })
  public lastMessageAt!: Date;

  @OneToMany(() => VtxSupportTicketMessageEntity, (m) => m.ticket)
  public messages!: VtxSupportTicketMessageEntity[];

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  public updatedAt!: Date;
}

