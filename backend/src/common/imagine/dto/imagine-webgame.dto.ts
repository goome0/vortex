import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ImagineWebGameSessionDTO {
  @ApiProperty({ description: 'Username' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  public username!: string;

  @ApiProperty({ description: 'Session ID' })
  @IsNotEmpty({ message: 'Session ID is required' })
  @IsString({ message: 'Session ID must be a string' })
  public sessionid!: string;
}

export class ImagineWebGameStartDTO extends ImagineWebGameSessionDTO {
  @ApiProperty({ description: 'Game type name' })
  @IsNotEmpty({ message: 'Game type is required' })
  @IsString({ message: 'Game type must be a string' })
  public type!: string;
}

export class ImagineWebGameUpdateDTO extends ImagineWebGameSessionDTO {
  @ApiProperty({ description: 'Action name' })
  @IsNotEmpty({ message: 'Action is required' })
  @IsString({ message: 'Action must be a string' })
  public action!: string;

  @ApiPropertyOptional({
    description: 'Additional data (key/value payload)',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  public data?: Record<string, unknown>;
}

// --- Response DTOs ---

export class ImagineWebGameGetCoinsResponseDTO {
  public error!: string;
  public coins!: string;
}

export class ImagineWebGameStartResponseDTO {
  public error!: string;
  public name?: string;
  public coins?: string;
}

export class ImagineWebGameUpdateResponseDTO {
  public error!: string;
  [key: string]: unknown;
}
