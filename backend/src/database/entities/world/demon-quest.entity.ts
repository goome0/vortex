import { Column, Entity, Index } from "typeorm";

@Index("idx_DemonQuest_Demon", ["demon"], {})
@Index("idx_DemonQuest_Character", ["character"], {})
@Entity("DemonQuest", { schema: "world" })
export class DemonQuest {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Demon", nullable: true, length: 36 })
  public demon!: string | null;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("int", { name: "Type", nullable: true })
  public type!: number | null;

  @Column("blob", { name: "Targets", nullable: true })
  public targets!: Buffer | null;

  @Column("blob", { name: "TargetCurrentCounts", nullable: true })
  public targetCurrentCounts!: Buffer | null;

  @Column("blob", { name: "RewardItems", nullable: true })
  public rewardItems!: Buffer | null;

  @Column("int", { name: "XPReward", nullable: true })
  public xpReward!: number | null;

  @Column("blob", { name: "BonusItems", nullable: true })
  public bonusItems!: Buffer | null;

  @Column("blob", { name: "BonusTitles", nullable: true })
  public bonusTitles!: Buffer | null;

  @Column("blob", { name: "BonusXP", nullable: true })
  public bonusXp!: Buffer | null;

  @Column("bigint", { name: "ChanceItem", nullable: true })
  public chanceItem!: string | null;

  @Column("int", { name: "ChanceItemCount", nullable: true })
  public chanceItemCount!: number | null;
}
