export interface ICurrentUser {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly disp_name: string;
  readonly user_level: number;
  readonly enabled: boolean;
  readonly challenge: string;
  readonly permissions?: string[];
}
