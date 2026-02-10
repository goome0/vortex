import { Column, Entity, Index } from "typeorm";

@Index("idx_EventCounter_Character", ["character"], {})
@Index("idx_EventCounter_RelatedTo", ["relatedTo"], {})
@Index("idx_EventCounter_Type", ["type"], {})
@Index("idx_EventCounter_GroupCounter", ["groupCounter"], {})
@Entity("EventCounter", { schema: "world" })
export class EventCounter {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("varchar", { name: "RelatedTo", nullable: true, length: 36 })
  public relatedTo!: string | null;

  @Column("int", { name: "Type", nullable: true })
  public type!: number | null;

  @Column("int", { name: "Counter", nullable: true })
  public counter!: number | null;

  @Column("int", { name: "PreExpireType", nullable: true })
  public preExpireType!: number | null;

  @Column("bit", { name: "GroupCounter", nullable: true })
  public groupCounter!: boolean | null;

  @Column("bigint", { name: "Timestamp", nullable: true })
  public timestamp!: string | null;
}
