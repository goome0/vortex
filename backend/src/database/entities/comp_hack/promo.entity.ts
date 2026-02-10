import { Column, Entity, Index } from "typeorm";

@Index("idx_Promo_Code", ["code"], {})
@Entity("Promo", { schema: "comp_hack" })
export class Promo {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("text", { name: "Code", nullable: true })
  public code!: string | null;

  @Column("bigint", { name: "StartTime", nullable: true })
  public startTime!: string | null;

  @Column("bigint", { name: "EndTime", nullable: true })
  public endTime!: string | null;

  @Column("int", { name: "UseLimit", nullable: true })
  public useLimit!: number | null;

  @Column("int", { name: "LimitType", nullable: true })
  public limitType!: number | null;

  @Column("blob", { name: "PostItems", nullable: true })
  public postItems!: Buffer | null;
}
