import { Column, Entity, Index } from "typeorm";

@Index("idx_Character_Name", ["name"], {})
@Index("idx_Character_Account", ["account"], {})
@Entity("Character", { schema: "world" })
export class Character {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("text", { name: "Name", nullable: true })
  public name!: string | null;

  @Column("varchar", { name: "Account", nullable: true, length: 36 })
  public account!: string | null;

  @Column("int", { name: "WorldID", nullable: true })
  public worldId!: number | null;

  @Column("bigint", { name: "KillTime", nullable: true })
  public killTime!: string | null;

  @Column("int", { name: "Gender", nullable: true })
  public gender!: number | null;

  @Column("int", { name: "SkinType", nullable: true })
  public skinType!: number | null;

  @Column("int", { name: "HairType", nullable: true })
  public hairType!: number | null;

  @Column("int", { name: "FaceType", nullable: true })
  public faceType!: number | null;

  @Column("int", { name: "EyeType", nullable: true })
  public eyeType!: number | null;

  @Column("int", { name: "HairColor", nullable: true })
  public hairColor!: number | null;

  @Column("int", { name: "LeftEyeColor", nullable: true })
  public leftEyeColor!: number | null;

  @Column("int", { name: "RightEyeColor", nullable: true })
  public rightEyeColor!: number | null;

  @Column("int", { name: "LNC", nullable: true })
  public lnc!: number | null;

  @Column("int", { name: "Points", nullable: true })
  public points!: number | null;

  @Column("int", { name: "ExpertiseExtension", nullable: true })
  public expertiseExtension!: number | null;

  @Column("varchar", { name: "COMP", nullable: true, length: 36 })
  public comp!: string | null;

  @Column("varchar", { name: "ActiveDemon", nullable: true, length: 36 })
  public activeDemon!: string | null;

  @Column("bigint", { name: "HomepointZone", nullable: true })
  public homepointZone!: string | null;

  @Column("bigint", { name: "HomepointSpotID", nullable: true })
  public homepointSpotId!: string | null;

  @Column("bigint", { name: "LogoutZone", nullable: true })
  public logoutZone!: string | null;

  @Column("bigint", { name: "LogoutInstance", nullable: true })
  public logoutInstance!: string | null;

  @Column("float", { name: "LogoutX", nullable: true, precision: 12 })
  public logoutX!: number | null;

  @Column("float", { name: "LogoutY", nullable: true, precision: 12 })
  public logoutY!: number | null;

  @Column("float", { name: "LogoutRotation", nullable: true, precision: 12 })
  public logoutRotation!: number | null;

  @Column("bigint", { name: "PreviousZone", nullable: true })
  public previousZone!: string | null;

  @Column("int", { name: "LoginPoints", nullable: true })
  public loginPoints!: number | null;

  @Column("bigint", { name: "LastLogin", nullable: true })
  public lastLogin!: string | null;

  @Column("varchar", { name: "Clan", nullable: true, length: 36 })
  public clan!: string | null;

  @Column("int", { name: "CurrentTitle", nullable: true })
  public currentTitle!: number | null;

  @Column("bit", { name: "TitlePrioritized", nullable: true })
  public titlePrioritized!: boolean | null;

  @Column("bit", { name: "SupportDisplay", nullable: true })
  public supportDisplay!: boolean | null;

  @Column("bigint", { name: "FusionGauge", nullable: true })
  public fusionGauge!: string | null;

  @Column("blob", { name: "LearnedSkills", nullable: true })
  public learnedSkills!: Buffer | null;

  @Column("blob", { name: "EquippedItems", nullable: true })
  public equippedItems!: Buffer | null;

  @Column("blob", { name: "EquippedVA", nullable: true })
  public equippedVa!: Buffer | null;

  @Column("blob", { name: "Materials", nullable: true })
  public materials!: Buffer | null;

  @Column("blob", { name: "ItemBoxes", nullable: true })
  public itemBoxes!: Buffer | null;

  @Column("blob", { name: "VACloset", nullable: true })
  public vaCloset!: Buffer | null;

  @Column("blob", { name: "Expertises", nullable: true })
  public expertises!: Buffer | null;

  @Column("blob", { name: "StatusEffects", nullable: true })
  public statusEffects!: Buffer | null;

  @Column("blob", { name: "Quests", nullable: true })
  public quests!: Buffer | null;

  @Column("blob", { name: "Hotbars", nullable: true })
  public hotbars!: Buffer | null;

  @Column("blob", { name: "CommonSwitch", nullable: true })
  public commonSwitch!: Buffer | null;

  @Column("blob", { name: "AutoRecovery", nullable: true })
  public autoRecovery!: Buffer | null;

  @Column("blob", { name: "CustomTitles", nullable: true })
  public customTitles!: Buffer | null;

  @Column("blob", { name: "ActionCooldowns", nullable: true })
  public actionCooldowns!: Buffer | null;

  @Column("varchar", { name: "CoreStats", nullable: true, length: 36 })
  public coreStats!: string | null;

  @Column("varchar", { name: "Progress", nullable: true, length: 36 })
  public progress!: string | null;

  @Column("varchar", { name: "FriendSettings", nullable: true, length: 36 })
  public friendSettings!: string | null;

  @Column("varchar", { name: "DemonQuest", nullable: true, length: 36 })
  public demonQuest!: string | null;

  @Column("varchar", { name: "CultureData", nullable: true, length: 36 })
  public cultureData!: string | null;

  @Column("varchar", { name: "PvPData", nullable: true, length: 36 })
  public pvPData!: string | null;
}
