import { Column, Entity, Index } from "typeorm";

@Index("idx_RegisteredWorld_ID", ["id"], {})
@Entity("RegisteredWorld", { schema: "comp_hack" })
export class RegisteredWorld {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("int", { name: "ID", nullable: true })
  public id!: number | null;

  @Column("text", { name: "Name", nullable: true })
  public name!: string | null;

  @Column("int", { name: "Status", nullable: true })
  public status!: number | null;
}
