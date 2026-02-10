import { ICurrentUser } from '../interfaces/current-user.interface';

export class CurrentUserDTO implements ICurrentUser {
  public id!: string;
  public username!: string;
  public email!: string;
  public disp_name!: string;
  public user_level!: number;
  public enabled!: boolean;
  public challenge!: string;
  public permissions?: string[];
}
