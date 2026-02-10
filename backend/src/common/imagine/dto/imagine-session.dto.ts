import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImagineSessionDTO {
  @ApiProperty({ description: 'Session username' })
  @IsNotEmpty({ message: 'Session username is required' })
  @IsString({ message: 'Session username must be a string' })
  public session_username!: string;

  @ApiProperty({ description: 'Challenge response' })
  @IsNotEmpty({ message: 'Challenge is required' })
  @IsString({ message: 'Challenge must be a string' })
  public challenge!: string;
}
