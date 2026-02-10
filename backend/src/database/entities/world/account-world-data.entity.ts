import { Column, Entity, Index } from "typeorm";

@Index("idx_AccountWorldData_Account", ["account"], {})
@Index("idx_AccountWorldData_CleanupRequired", ["cleanupRequired"], {})
@Entity("AccountWorldData", { schema: "world" })
export class AccountWorldData {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Account", nullable: true, length: 36 })
  public account!: string | null;

  @Column("blob", { name: "DemonBoxes", nullable: true })
  public demonBoxes!: Buffer | null;

  @Column("blob", { name: "ItemBoxes", nullable: true })
  public itemBoxes!: Buffer | null;

  @Column("blob", { name: "DevilBook", nullable: true })
  public devilBook!: Buffer | null;

  @Column("varchar", { name: "BazaarData", nullable: true, length: 36 })
  public bazaarData!: string | null;

  @Column("blob", { name: "Blacklist", nullable: true })
  public blacklist!: Buffer | null;

  @Column("bigint", { name: "ReunionPoints", nullable: true })
  public reunionPoints!: string | null;

  @Column("bigint", { name: "MitamaReunionPoints", nullable: true })
  public mitamaReunionPoints!: string | null;

  @Column("blob", { name: "ActionCooldowns", nullable: true })
  public actionCooldowns!: Buffer | null;

  @Column("bit", { name: "CleanupRequired", nullable: true })
  public cleanupRequired!: boolean | null;
}
