import { Column, Entity, Index } from "typeorm";

@Index("idx_ReportedPlayer_PlayerName", ["playerName"], {})
@Index("idx_ReportedPlayer_Player", ["player"], {})
@Index("idx_ReportedPlayer_Reporter", ["reporter"], {})
@Index("idx_ReportedPlayer_Resolved", ["resolved"], {})
@Index("idx_ReportedPlayer_Resolver", ["resolver"], {})
@Entity("ReportedPlayer", { schema: "world" })
export class ReportedPlayer {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("text", { name: "PlayerName", nullable: true })
  public playerName!: string | null;

  @Column("varchar", { name: "Player", nullable: true, length: 36 })
  public player!: string | null;

  @Column("varchar", { name: "Reporter", nullable: true, length: 36 })
  public reporter!: string | null;

  @Column("text", { name: "Location", nullable: true })
  public location!: string | null;

  @Column("int", { name: "Subject", nullable: true })
  public subject!: number | null;

  @Column("text", { name: "Comment", nullable: true })
  public comment!: string | null;

  @Column("bit", { name: "Resolved", nullable: true })
  public resolved!: boolean | null;

  @Column("varchar", { name: "Resolver", nullable: true, length: 36 })
  public resolver!: string | null;

  @Column("bigint", { name: "ReportTime", nullable: true })
  public reportTime!: string | null;

  @Column("bigint", { name: "ResolveTime", nullable: true })
  public resolveTime!: string | null;
}
