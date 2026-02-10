import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ServerControlCommandInputDTO {
  @ApiPropertyOptional({ description: 'Reason for auditing/logging', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  public reason?: string;

  @ApiPropertyOptional({ description: 'Do not execute, only show command', default: false })
  @IsOptional()
  public dryRun?: boolean;
}

