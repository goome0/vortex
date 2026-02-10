import { Column, Entity, Index } from "typeorm";

@Index("idx_PentalphaEntry_Character", ["character"], {})
@Index("idx_PentalphaEntry_Match", ["match"], {})
@Entity("PentalphaEntry", { schema: "world" })
export class PentalphaEntry {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("varchar", { name: "Match", nullable: true, length: 36 })
  public match!: string | null;

  @Column("int", { name: "Team", nullable: true })
  public team!: number | null;

  @Column("int", { name: "Bethel", nullable: true })
  public bethel!: number | null;

  @Column("int", { name: "Cowrie", nullable: true })
  public cowrie!: number | null;

  @Column("blob", { name: "Points", nullable: true })
  public points!: Buffer | null;

  @Column("bit", { name: "Active", nullable: true })
  public active!: boolean | null;
}
