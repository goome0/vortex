import { Column, Entity, Index } from "typeorm";

@Index("idx_Account_Username", ["username"], {})
@Index("idx_Account_Email", ["email"], {})
@Entity("Account", { schema: "comp_hack" })
export class Account {
  @Column("varchar", { primary: true, name: "UID", length: 36 })
  public uid!: string;

  @Column("text", { name: "Username", nullable: true })
  public username!: string | null;

  @Column("text", { name: "DisplayName", nullable: true })
  public displayName!: string | null;

  @Column("text", { name: "Email", nullable: true })
  public email!: string | null;

  @Column("text", { name: "Password", nullable: true })
  public password!: string | null;

  @Column("text", { name: "Salt", nullable: true })
  public salt!: string | null;

  @Column("bigint", { name: "CP", nullable: true })
  public cp!: string | null;

  @Column("int", { name: "TicketCount", nullable: true })
  public ticketCount!: number | null;

  @Column("int", { name: "UserLevel", nullable: true })
  public userLevel!: number | null;

  @Column("bit", { name: "Enabled", nullable: true })
  public enabled!: boolean | null;

  @Column("bit", { name: "APIOnly", nullable: true })
  public apiOnly!: boolean | null;

  @Column("bigint", { name: "LastLogin", nullable: true })
  public lastLogin!: string | null;

  @Column("bigint", { name: "LastLogout", nullable: true })
  public lastLogout!: string | null;

  @Column("text", { name: "BanReason", nullable: true })
  public banReason!: string | null;

  @Column("text", { name: "BanInitiator", nullable: true })
  public banInitiator!: string | null;

  @Column("blob", { name: "Characters", nullable: true })
  public characters!: Buffer | null;
}
