import { Column, Entity, Index } from "typeorm";

@Index("idx_Expertise_Character", ["character"], {})
@Entity("Expertise", { schema: "world" })
export class Expertise {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("int", { name: "ExpertiseID", nullable: true })
  public expertiseId!: number | null;

  @Column("int", { name: "Points", nullable: true })
  public points!: number | null;

  @Column("bit", { name: "Disabled", nullable: true })
  public disabled!: boolean | null;
}
