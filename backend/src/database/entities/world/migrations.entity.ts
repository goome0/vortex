import { Column, Entity } from "typeorm";

@Entity("Migrations", { schema: "world" })
export class Migrations {
  @Column("varchar", { primary: true, name: "Migration", length: 128 })
  public migration!: string;
}
