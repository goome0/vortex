import { Column, Entity, Index } from "typeorm";

@Index("idx_ItemBox_Account", ["account"], {})
@Index("idx_ItemBox_Character", ["character"], {})
@Entity("ItemBox", { schema: "world" })
export class ItemBox {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("bigint", { name: "BoxID", nullable: true })
  public boxId!: string | null;

  @Column("int", { name: "Type", nullable: true })
  public type!: number | null;

  @Column("varchar", { name: "Account", nullable: true, length: 36 })
  public account!: string | null;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("blob", { name: "Items", nullable: true })
  public items!: Buffer | null;

  @Column("bigint", { name: "RentalExpiration", nullable: true })
  public rentalExpiration!: string | null;
}
