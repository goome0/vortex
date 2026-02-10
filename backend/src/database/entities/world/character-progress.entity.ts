import { Column, Entity, Index } from "typeorm";

@Index("idx_CharacterProgress_Character", ["character"], {})
@Entity("CharacterProgress", { schema: "world" })
export class CharacterProgress {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("int", { name: "MaxCOMPSlots", nullable: true })
  public maxCompSlots!: number | null;

  @Column("blob", { name: "Maps", nullable: true })
  public maps!: Buffer | null;

  @Column("blob", { name: "Plugins", nullable: true })
  public plugins!: Buffer | null;

  @Column("blob", { name: "Valuables", nullable: true })
  public valuables!: Buffer | null;

  @Column("blob", { name: "CompletedQuests", nullable: true })
  public completedQuests!: Buffer | null;

  @Column("int", { name: "DemonQuestSequence", nullable: true })
  public demonQuestSequence!: number | null;

  @Column("blob", { name: "DemonQuestsCompleted", nullable: true })
  public demonQuestsCompleted!: Buffer | null;

  @Column("int", { name: "DemonQuestDaily", nullable: true })
  public demonQuestDaily!: number | null;

  @Column("bigint", { name: "DemonQuestResetTime", nullable: true })
  public demonQuestResetTime!: string | null;

  @Column("int", { name: "TimeTrialID", nullable: true })
  public timeTrialId!: number | null;

  @Column("int", { name: "TimeTrialTime", nullable: true })
  public timeTrialTime!: number | null;

  @Column("int", { name: "TimeTrialResult", nullable: true })
  public timeTrialResult!: number | null;

  @Column("blob", { name: "TimeTrialRecords", nullable: true })
  public timeTrialRecords!: Buffer | null;

  @Column("blob", { name: "Titles", nullable: true })
  public titles!: Buffer | null;

  @Column("blob", { name: "SpecialTitles", nullable: true })
  public specialTitles!: Buffer | null;

  @Column("bigint", { name: "Coins", nullable: true })
  public coins!: string | null;

  @Column("blob", { name: "ITimePoints", nullable: true })
  public iTimePoints!: Buffer | null;

  @Column("blob", { name: "Bethel", nullable: true })
  public bethel!: Buffer | null;

  @Column("int", { name: "Cowrie", nullable: true })
  public cowrie!: number | null;

  @Column("blob", { name: "DigitalizeLevels", nullable: true })
  public digitalizeLevels!: Buffer | null;

  @Column("blob", { name: "DigitalizePoints", nullable: true })
  public digitalizePoints!: Buffer | null;

  @Column("blob", { name: "DigitalizeAssists", nullable: true })
  public digitalizeAssists!: Buffer | null;
}
