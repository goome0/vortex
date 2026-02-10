import { Column, Entity, Index } from "typeorm";

@Index("idx_UBTournament_StartTime", ["startTime"], {})
@Index("idx_UBTournament_EndTime", ["endTime"], {})
@Entity("UBTournament", { schema: "world" })
export class UbTournament {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("bigint", { name: "StartTime", nullable: true })
  public startTime!: string | null;

  @Column("bigint", { name: "EndTime", nullable: true })
  public endTime!: string | null;

  @Column("varchar", { name: "Previous", nullable: true, length: 36 })
  public previous!: string | null;
}
