import { Column, Entity, Index } from "typeorm";

@Index("idx_StatusEffect_Entity", ["entity"], {})
@Entity("StatusEffect", { schema: "world" })
export class StatusEffect {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("bigint", { name: "Effect", nullable: true })
  public effect!: string | null;

  @Column("varchar", { name: "Entity", nullable: true, length: 36 })
  public entity!: string | null;

  @Column("bigint", { name: "Expiration", nullable: true })
  public expiration!: string | null;

  @Column("int", { name: "Stack", nullable: true })
  public stack!: number | null;

  @Column("bit", { name: "IsConstant", nullable: true })
  public isConstant!: boolean | null;
}
