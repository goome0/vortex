import { Column, Entity, Index } from "typeorm";

@Index("idx_UBResult_Tournament", ["tournament"], {})
@Index("idx_UBResult_Character", ["character"], {})
@Index("idx_UBResult_Ranked", ["ranked"], {})
@Entity("UBResult", { schema: "world" })
export class UbResult {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Tournament", nullable: true, length: 36 })
  public tournament!: string | null;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("bigint", { name: "Points", nullable: true })
  public points!: string | null;

  @Column("bigint", { name: "TopPoints", nullable: true })
  public topPoints!: string | null;

  @Column("int", { name: "Matches", nullable: true })
  public matches!: number | null;

  @Column("int", { name: "TournamentRank", nullable: true })
  public tournamentRank!: number | null;

  @Column("int", { name: "AllTimeRank", nullable: true })
  public allTimeRank!: number | null;

  @Column("int", { name: "TopPointRank", nullable: true })
  public topPointRank!: number | null;

  @Column("bit", { name: "Ranked", nullable: true })
  public ranked!: boolean | null;
}
