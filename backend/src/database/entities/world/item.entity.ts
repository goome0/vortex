import { Column, Entity, Index } from "typeorm";

@Index("idx_Item_ItemBox", ["itemBox"], {})
@Entity("Item", { schema: "world" })
export class Item {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("bigint", { name: "Type", nullable: true })
  public type!: string | null;

  @Column("varchar", { name: "ItemBox", nullable: true, length: 36 })
  public itemBox!: string | null;

  @Column("int", { name: "BoxSlot", nullable: true })
  public boxSlot!: number | null;

  @Column("int", { name: "StackSize", nullable: true })
  public stackSize!: number | null;

  @Column("int", { name: "Durability", nullable: true })
  public durability!: number | null;

  @Column("int", { name: "MaxDurability", nullable: true })
  public maxDurability!: number | null;

  @Column("int", { name: "Tarot", nullable: true })
  public tarot!: number | null;

  @Column("int", { name: "Soul", nullable: true })
  public soul!: number | null;

  @Column("bigint", { name: "BasicEffect", nullable: true })
  public basicEffect!: string | null;

  @Column("bigint", { name: "SpecialEffect", nullable: true })
  public specialEffect!: string | null;

  @Column("blob", { name: "ModSlots", nullable: true })
  public modSlots!: Buffer | null;

  @Column("blob", { name: "FuseBonuses", nullable: true })
  public fuseBonuses!: Buffer | null;

  @Column("bigint", { name: "RentalExpiration", nullable: true })
  public rentalExpiration!: string | null;
}
