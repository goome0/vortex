import { Column, Entity, Index } from "typeorm";

@Index("idx_EntityStats_Entity", ["entity"], {})
@Entity("EntityStats", { schema: "world" })
export class EntityStats {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Entity", nullable: true, length: 36 })
  public entity!: string | null;

  @Column("int", { name: "Level", nullable: true })
  public level!: number | null;

  @Column("bigint", { name: "XP", nullable: true })
  public xp!: string | null;

  @Column("int", { name: "HP", nullable: true })
  public hp!: number | null;

  @Column("int", { name: "MP", nullable: true })
  public mp!: number | null;

  @Column("int", { name: "MaxHP", nullable: true })
  public maxHp!: number | null;

  @Column("int", { name: "MaxMP", nullable: true })
  public maxMp!: number | null;

  @Column("int", { name: "STR", nullable: true })
  public str!: number | null;

  @Column("int", { name: "MAGIC", nullable: true })
  public magic!: number | null;

  @Column("int", { name: "VIT", nullable: true })
  public vit!: number | null;

  @Column("int", { name: "INTEL", nullable: true })
  public intel!: number | null;

  @Column("int", { name: "SPEED", nullable: true })
  public speed!: number | null;

  @Column("int", { name: "LUCK", nullable: true })
  public luck!: number | null;

  @Column("int", { name: "CLSR", nullable: true })
  public clsr!: number | null;

  @Column("int", { name: "LNGR", nullable: true })
  public lngr!: number | null;

  @Column("int", { name: "SPELL", nullable: true })
  public spell!: number | null;

  @Column("int", { name: "SUPPORT", nullable: true })
  public support!: number | null;

  @Column("int", { name: "PDEF", nullable: true })
  public pdef!: number | null;

  @Column("int", { name: "MDEF", nullable: true })
  public mdef!: number | null;
}
