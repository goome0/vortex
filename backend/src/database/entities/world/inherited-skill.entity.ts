import { Column, Entity, Index } from "typeorm";

@Index("idx_InheritedSkill_Demon", ["demon"], {})
@Entity("InheritedSkill", { schema: "world" })
export class InheritedSkill {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("bigint", { name: "Skill", nullable: true })
  public skill!: string | null;

  @Column("varchar", { name: "Demon", nullable: true, length: 36 })
  public demon!: string | null;

  @Column("int", { name: "Progress", nullable: true })
  public progress!: number | null;
}
