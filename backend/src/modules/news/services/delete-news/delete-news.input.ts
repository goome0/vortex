import { IsUUID } from 'class-validator';

export class DeleteNewsInputDTO {
  @IsUUID()
  public id!: string;
}
