import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImagineGetChallengeDTO {
  @ApiProperty({ description: 'Username', example: 'john_doe' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  public username!: string;
}

export class ImagineGetChallengeResponseDTO {
  public challenge!: string;
  public salt!: string;
}
