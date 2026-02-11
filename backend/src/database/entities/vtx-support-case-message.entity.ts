import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VtxSupportCaseEntity } from './vtx-support-case.entity';

export enum EVtxCaseAuthorRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
}

@Entity({ name: 'vtx_support_case_messages' })
export class VtxSupportCaseMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Index()
  @Column({ type: 'uuid' })
  public caseId!: string;

  @ManyToOne(() => VtxSupportCaseEntity, (t) => t.messages, { onDelete: 'CASCADE' })
  public supportCase!: VtxSupportCaseEntity;

  @Index()
  @Column({ type: 'varchar', length: 32, nullable: true })
  public authorUsername!: string | null;

  @Column({ type: 'enum', enum: EVtxCaseAuthorRole })
  public authorRole!: EVtxCaseAuthorRole;

  @Column({ type: 'text' })
  public body!: string;

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  public createdAt!: Date;
}
