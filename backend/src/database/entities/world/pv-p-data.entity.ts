import { Column, Entity, Index } from "typeorm";

@Index("idx_PvPData_Character", ["character"], {})
@Entity("PvPData", { schema: "world" })
export class PvPData {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("int", { name: "BP", nullable: true })
  public bp!: number | null;

  @Column("int", { name: "GP", nullable: true })
  public gp!: number | null;

  @Column("bit", { name: "Ranked", nullable: true })
  public ranked!: boolean | null;

  @Column("int", { name: "KillTotal", nullable: true })
  public killTotal!: number | null;

  @Column("int", { name: "DeathTotal", nullable: true })
  public deathTotal!: number | null;

  @Column("int", { name: "BPTotal", nullable: true })
  public bpTotal!: number | null;

  @Column("blob", { name: "ModeStats", nullable: true })
  public modeStats!: Buffer | null;

  @Column("blob", { name: "Trophies", nullable: true })
  public trophies!: Buffer | null;

  @Column("int", { name: "PenaltyCount", nullable: true })
  public penaltyCount!: number | null;
}
