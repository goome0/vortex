import { Column, Entity, Index } from "typeorm";

@Index("idx_BazaarData_Account", ["account"], {})
@Index("idx_BazaarData_Zone", ["zone"], {})
@Entity("BazaarData", { schema: "world" })
export class BazaarData {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Account", nullable: true, length: 36 })
  public account!: string | null;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("bigint", { name: "Zone", nullable: true })
  public zone!: string | null;

  @Column("bigint", { name: "MarketID", nullable: true })
  public marketId!: string | null;

  @Column("int", { name: "ChannelID", nullable: true })
  public channelId!: number | null;

  @Column("text", { name: "Comment", nullable: true })
  public comment!: string | null;

  @Column("int", { name: "NPCType", nullable: true })
  public npcType!: number | null;

  @Column("int", { name: "State", nullable: true })
  public state!: number | null;

  @Column("bigint", { name: "Expiration", nullable: true })
  public expiration!: string | null;

  @Column("blob", { name: "Items", nullable: true })
  public items!: Buffer | null;
}
