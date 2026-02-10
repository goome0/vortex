import { Column, Entity, Index } from "typeorm";

@Index("idx_Quest_Character", ["character"], {})
@Entity("Quest", { schema: "world" })
export class Quest {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("int", { name: "QuestID", nullable: true })
  public questId!: number | null;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("int", { name: "Phase", nullable: true })
  public phase!: number | null;

  @Column("blob", { name: "CustomData", nullable: true })
  public customData!: Buffer | null;

  @Column("blob", { name: "FlagStates", nullable: true })
  public flagStates!: Buffer | null;
}
