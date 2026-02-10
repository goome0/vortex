import { Column, Entity, Index } from "typeorm";

@Index("idx_PromoExchange_Promo", ["promo"], {})
@Index("idx_PromoExchange_Account", ["account"], {})
@Index("idx_PromoExchange_Character", ["character"], {})
@Entity("PromoExchange", { schema: "comp_hack" })
export class PromoExchange {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Promo", nullable: true, length: 36 })
  public promo!: string | null;

  @Column("varchar", { name: "Account", nullable: true, length: 36 })
  public account!: string | null;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("int", { name: "WorldID", nullable: true })
  public worldId!: number | null;

  @Column("bigint", { name: "Timestamp", nullable: true })
  public timestamp!: string | null;
}
