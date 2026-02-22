import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Singleton entity for launcher config (hero + background).
 * Only one row exists (id = 1). Env vars are used as fallback when DB values are null.
 */
@Entity({ name: 'vtx_launcher_config' })
export class VtxLauncherConfigEntity {
  @PrimaryColumn({ type: 'int', default: 1 })
  public id!: number;

  @Column({ type: 'varchar', length: 128, nullable: true })
  public heroSubtitle!: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  public heroTitle!: string | null;

  @Column({ type: 'text', nullable: true })
  public heroDescription!: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  public backgroundUrl!: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  public backgroundAlt!: string | null;

  @UpdateDateColumn({ type: 'datetime', precision: 3 })
  public updatedAt!: Date;
}
