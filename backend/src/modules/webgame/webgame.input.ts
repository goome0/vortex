import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WebGameStartInputDTO {
  @ApiProperty({ description: 'Game type name' })
  @IsNotEmpty({ message: 'Game type is required' })
  @IsString({ message: 'Game type must be a string' })
  public type!: string;
}

export class WebGameUpdateInputDTO {
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
