import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SignUpInputDTO {
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
    description: 'Email',
    example: 'john.doe@example.com',
    type: String,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  @MaxLength(255, { message: 'Email must be less than 255 characters' })
  public email!: string;

  @ApiProperty({
    description: 'Password',
    example: 'P@ssw0rd123',
    type: String,
    maxLength: 16,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MaxLength(16, { message: 'Password must be less than 16 characters' })
  public password!: string;
}
