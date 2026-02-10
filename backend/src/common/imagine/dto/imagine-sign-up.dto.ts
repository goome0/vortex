import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength } from 'class-validator';

export class ImagineSignUpDTO {
  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @MaxLength(100, { message: 'Username must be less than 100 characters' })
  public username!: string;

  @ApiProperty({
    description: 'Email',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  @MaxLength(255, { message: 'Email must be less than 255 characters' })
  public email!: string;

  @ApiProperty({
    description: 'Password',
    example: 'P@ssw0rd123',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MaxLength(128, { message: 'Password must be less than 128 characters' })
  @IsStrongPassword(
    {
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
      minLowercase: 1,
    },
    {
      message:
        'Password must be at least 8 characters long, including uppercase letter, lowercase letter, number and symbol',
    },
  )
  public password!: string;
}
