import { Column, Entity, Index } from "typeorm";

@Index("idx_Hotbar_Character", ["character"], {})
@Entity("Hotbar", { schema: "world" })
export class Hotbar {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("int", { name: "PageID", nullable: true })
  public pageId!: number | null;

  @Column("blob", { name: "ItemTypes", nullable: true })
  public itemTypes!: Buffer | null;

  @Column("blob", { name: "Items", nullable: true })
  public items!: Buffer | null;

  @Column("blob", { name: "ItemIDs", nullable: true })
  public itemIDs!: Buffer | null;
}
