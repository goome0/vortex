import { Column, Entity, Index } from "typeorm";

@Index("idx_Demon_DemonBox", ["demonBox"], {})
@Entity("Demon", { schema: "world" })
export class Demon {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("bigint", { name: "Type", nullable: true })
  public type!: string | null;

  @Column("varchar", { name: "DemonBox", nullable: true, length: 36 })
  public demonBox!: string | null;

  @Column("int", { name: "BoxSlot", nullable: true })
  public boxSlot!: number | null;

  @Column("int", { name: "AttackSettings", nullable: true })
  public attackSettings!: number | null;

  @Column("int", { name: "GrowthType", nullable: true })
  public growthType!: number | null;

  @Column("int", { name: "MitamaRank", nullable: true })
  public mitamaRank!: number | null;

  @Column("int", { name: "MitamaType", nullable: true })
  public mitamaType!: number | null;

  @Column("int", { name: "MagReduction", nullable: true })
  public magReduction!: number | null;

  @Column("int", { name: "SoulPoints", nullable: true })
  public soulPoints!: number | null;

  @Column("int", { name: "Familiarity", nullable: true })
  public familiarity!: number | null;

  @Column("bit", { name: "Locked", nullable: true })
  public locked!: boolean | null;

  @Column("int", { name: "BenefitGauge", nullable: true })
  public benefitGauge!: number | null;

  @Column("int", { name: "ForceStackPending", nullable: true })
  public forceStackPending!: number | null;

  @Column("bit", { name: "HasQuest", nullable: true })
  public hasQuest!: boolean | null;

  @Column("blob", { name: "AcquiredSkills", nullable: true })
  public acquiredSkills!: Buffer | null;

  @Column("blob", { name: "LearnedSkills", nullable: true })
  public learnedSkills!: Buffer | null;

  @Column("blob", { name: "InheritedSkills", nullable: true })
  public inheritedSkills!: Buffer | null;

  @Column("blob", { name: "StatusEffects", nullable: true })
  public statusEffects!: Buffer | null;

  @Column("blob", { name: "Reunion", nullable: true })
  public reunion!: Buffer | null;

  @Column("blob", { name: "MitamaReunion", nullable: true })
  public mitamaReunion!: Buffer | null;

  @Column("blob", { name: "ForceValues", nullable: true })
  public forceValues!: Buffer | null;

  @Column("blob", { name: "ForceStack", nullable: true })
  public forceStack!: Buffer | null;

  @Column("blob", { name: "EquippedItems", nullable: true })
  public equippedItems!: Buffer | null;

  @Column("varchar", { name: "CoreStats", nullable: true, length: 36 })
  public coreStats!: string | null;
}
