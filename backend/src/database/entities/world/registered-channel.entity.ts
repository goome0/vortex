import { Column, Entity, Index } from "typeorm";

@Index("idx_RegisteredChannel_ID", ["id"], {})
@Entity("RegisteredChannel", { schema: "world" })
export class RegisteredChannel {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("int", { name: "ID", nullable: true })
  public id!: number | null;

  @Column("text", { name: "Name", nullable: true })
  public name!: string | null;

  @Column("text", { name: "IP", nullable: true })
  public ip!: string | null;

  @Column("int", { name: "Port", nullable: true })
  public port!: number | null;
}
