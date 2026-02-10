import { Column, Entity, Index } from "typeorm";

@Index("idx_BazaarItem_Item", ["item"], {})
@Index("idx_BazaarItem_Account", ["account"], {})
@Entity("BazaarItem", { schema: "world" })
export class BazaarItem {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Item", nullable: true, length: 36 })
  public item!: string | null;

  @Column("varchar", { name: "Account", nullable: true, length: 36 })
  public account!: string | null;

  @Column("bigint", { name: "Type", nullable: true })
  public type!: string | null;

  @Column("int", { name: "StackSize", nullable: true })
  public stackSize!: number | null;

  @Column("bigint", { name: "Cost", nullable: true })
  public cost!: string | null;

  @Column("bit", { name: "Sold", nullable: true })
  public sold!: boolean | null;
}
