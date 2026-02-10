import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ResetPasswordInputDTO {
  @ApiProperty({
    description: 'New password',
    example: 'N3wP@ssw0rd',
    type: String,
    maxLength: 16,
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @MaxLength(16, { message: 'New password must be less than 16 characters' })
  public newPassword!: string;
}
