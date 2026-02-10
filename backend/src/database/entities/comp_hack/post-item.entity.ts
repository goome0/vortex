import { Column, Entity, Index } from "typeorm";

@Index("idx_PostItem_Account", ["account"], {})
@Entity("PostItem", { schema: "comp_hack" })
export class PostItem {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("bigint", { name: "Type", nullable: true })
  public type!: string | null;

  @Column("varchar", { name: "Account", nullable: true, length: 36 })
  public account!: string | null;

  @Column("int", { name: "Source", nullable: true })
  public source!: number | null;

  @Column("bigint", { name: "Timestamp", nullable: true })
  public timestamp!: string | null;

  @Column("text", { name: "FromName", nullable: true })
  public fromName!: string | null;

  @Column("text", { name: "GiftMessage", nullable: true })
  public giftMessage!: string | null;

  @Column("int", { name: "DistributionMessageID", nullable: true })
  public distributionMessageId!: number | null;
}
