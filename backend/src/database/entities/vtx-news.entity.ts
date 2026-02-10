import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EVtxNewsBadgeVariant {
  DEFAULT = 'default',
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
}

@Entity({ name: 'vtx_news' })
export class VtxNewsEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 96 })
  public slug!: string;

  @Index()
  @Column({ type: 'varchar', length: 180 })
  public title!: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  public excerpt!: string | null;

  @Column({ type: 'text', nullable: true })
  public content!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 48, nullable: true })
  public category!: string | null;

  @Column({ type: 'enum', enum: EVtxNewsBadgeVariant, default: EVtxNewsBadgeVariant.DEFAULT })
  public badgeVariant!: EVtxNewsBadgeVariant;

  @Index()
  @Column({ type: 'boolean', default: false })
  public featured!: boolean;

  @Column({ type: 'varchar', length: 16, nullable: true })
  public readTime!: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  public imageUrl!: string | null;

  @Index()
  @Column({ type: 'boolean', default: false })
  public isPublished!: boolean;

  @Index()
  @Column({ type: 'datetime', precision: 3, nullable: true })
  public publishedAt!: Date | null;

  @Index()
  @Column({ type: 'varchar', length: 32, nullable: true })
  public createdByUsername!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 32, nullable: true })
  public updatedByUsername!: string | null;

  @CreateDateColumn({ type: 'datetime', precision: 3 })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  public updatedAt!: Date;
}

