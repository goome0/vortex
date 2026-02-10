import { Column, Entity } from "typeorm";

@Entity("Migrations", { schema: "comp_hack" })
export class Migrations {
  @Column("varchar", { primary: true, name: "Migration", length: 128 })
  public migration!: string;
}
