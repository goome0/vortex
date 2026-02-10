import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VtxSupportTicketEntity } from './vtx-support-ticket.entity';

export enum EVtxTicketAuthorRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
}

@Entity({ name: 'vtx_support_ticket_messages' })
export class VtxSupportTicketMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Index()
  @Column({ type: 'uuid' })
  public ticketId!: string;

  @ManyToOne(() => VtxSupportTicketEntity, (t) => t.messages, { onDelete: 'CASCADE' })
  public ticket!: VtxSupportTicketEntity;

  @Index()
  @Column({ type: 'varchar', length: 32, nullable: true })
  public authorUsername!: string | null;

  @Column({ type: 'enum', enum: EVtxTicketAuthorRole })
  public authorRole!: EVtxTicketAuthorRole;

  @Column({ type: 'text' })
  public body!: string;

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  public createdAt!: Date;
}

