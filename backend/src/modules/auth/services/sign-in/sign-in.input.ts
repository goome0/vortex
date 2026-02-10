import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SignInInputDTO {
  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
    type: String,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @MaxLength(100, { message: 'Username must be less than 100 characters' })
  public username!: string;

  @ApiProperty({
    description: 'Password',
    example: 'P@ssw0rd123',
    type: String,
    maxLength: 128,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MaxLength(128, { message: 'Password must be less than 128 characters' })
  public password!: string;
}
