import { Column, Entity, Index } from "typeorm";

@Index("idx_CultureData_Character", ["character"], {})
@Index("idx_CultureData_Zone", ["zone"], {})
@Entity("CultureData", { schema: "world" })
export class CultureData {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("bigint", { name: "Zone", nullable: true })
  public zone!: string | null;

  @Column("bigint", { name: "MachineID", nullable: true })
  public machineId!: string | null;

  @Column("varchar", { name: "Item", nullable: true, length: 36 })
  public item!: string | null;

  @Column("bigint", { name: "Expiration", nullable: true })
  public expiration!: string | null;

  @Column("bit", { name: "Active", nullable: true })
  public active!: boolean | null;

  @Column("blob", { name: "Points", nullable: true })
  public points!: Buffer | null;

  @Column("blob", { name: "ItemHistory", nullable: true })
  public itemHistory!: Buffer | null;

  @Column("bigint", { name: "ItemCount", nullable: true })
  public itemCount!: string | null;
}
