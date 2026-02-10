import { Column, Entity, Index } from "typeorm";

@Index("idx_FriendSettings_Character", ["character"], {})
@Entity("FriendSettings", { schema: "world" })
export class FriendSettings {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("varchar", { name: "Character", nullable: true, length: 36 })
  public character!: string | null;

  @Column("text", { name: "FriendMessage", nullable: true })
  public friendMessage!: string | null;

  @Column("blob", { name: "Friends", nullable: true })
  public friends!: Buffer | null;

  @Column("bit", { name: "PublicToZone", nullable: true })
  public publicToZone!: boolean | null;
}
