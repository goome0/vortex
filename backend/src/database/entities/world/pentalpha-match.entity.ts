import { Column, Entity, Index } from "typeorm";

@Index("idx_PentalphaMatch_StartTime", ["startTime"], {})
@Index("idx_PentalphaMatch_EndTime", ["endTime"], {})
@Entity("PentalphaMatch", { schema: "world" })
export class PentalphaMatch {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("bigint", { name: "StartTime", nullable: true })
  public startTime!: string | null;

  @Column("bigint", { name: "EndTime", nullable: true })
  public endTime!: string | null;

  @Column("varchar", { name: "Previous", nullable: true, length: 36 })
  public previous!: string | null;

  @Column("blob", { name: "Points", nullable: true })
  public points!: Buffer | null;

  @Column("blob", { name: "Rankings", nullable: true })
  public rankings!: Buffer | null;
}
