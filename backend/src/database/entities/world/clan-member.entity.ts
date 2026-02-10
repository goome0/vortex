import { Column, Entity, Index } from "typeorm";

@Index("idx_ClanMember_Clan", ["clan"], {})
@Index("idx_ClanMember_Character", ["character"], {})
@Entity("ClanMember", { schema: "world" })
export class ClanMember {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Clan", nullable: true, length: 36 })
  public clan!: string | null;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("text", { name: "ClanMessage", nullable: true })
  public clanMessage!: string | null;

  @Column("int", { name: "MemberType", nullable: true })
  public memberType!: number | null;
}
