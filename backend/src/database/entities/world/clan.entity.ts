import { Column, Entity, Index } from "typeorm";

@Index("idx_Clan_Name", ["name"], {})
@Entity("Clan", { schema: "world" })
export class Clan {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("text", { name: "Name", nullable: true })
  public name!: string | null;

  @Column("int", { name: "Level", nullable: true })
  public level!: number | null;

  @Column("bigint", { name: "BaseZoneID", nullable: true })
  public baseZoneId!: string | null;

  @Column("blob", { name: "Members", nullable: true })
  public members!: Buffer | null;

  @Column("int", { name: "EmblemBase", nullable: true })
  public emblemBase!: number | null;

  @Column("int", { name: "EmblemSymbol", nullable: true })
  public emblemSymbol!: number | null;

  @Column("int", { name: "EmblemColorR1", nullable: true })
  public emblemColorR1!: number | null;

  @Column("int", { name: "EmblemColorG1", nullable: true })
  public emblemColorG1!: number | null;

  @Column("int", { name: "EmblemColorB1", nullable: true })
  public emblemColorB1!: number | null;

  @Column("int", { name: "EmblemColorR2", nullable: true })
  public emblemColorR2!: number | null;

  @Column("int", { name: "EmblemColorG2", nullable: true })
  public emblemColorG2!: number | null;

  @Column("int", { name: "EmblemColorB2", nullable: true })
  public emblemColorB2!: number | null;
}
