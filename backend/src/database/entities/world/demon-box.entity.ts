import { Column, Entity, Index } from "typeorm";

@Index("idx_DemonBox_Account", ["account"], {})
@Index("idx_DemonBox_Character", ["character"], {})
@Entity("DemonBox", { schema: "world" })
export class DemonBox {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("int", { name: "BoxID", nullable: true })
  public boxId!: number | null;

  @Column("varchar", { name: "Account", nullable: true, length: 36 })
  public account!: string | null;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("blob", { name: "Demons", nullable: true })
  public demons!: Buffer | null;

  @Column("bigint", { name: "RentalExpiration", nullable: true })
  public rentalExpiration!: string | null;
}
