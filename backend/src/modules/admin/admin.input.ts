import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AdminGetAccountInputDTO {
  @ApiProperty({ description: 'Username to fetch' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  public username!: string;
}

export class AdminUpdateAccountInputDTO {
  @ApiProperty({ description: 'Username to update' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  public username!: string;

  @ApiPropertyOptional({ description: 'New password' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  public password?: string;

  @ApiPropertyOptional({ description: 'Display name' })
  @IsOptional()
  @IsString()
  public disp_name?: string;

  @ApiPropertyOptional({ description: 'Crown Points' })
  @IsOptional()
  @IsInt()
  @Min(0)
  public cp?: number;

  @ApiPropertyOptional({ description: 'Ticket count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  public ticket_count?: number;

  @ApiPropertyOptional({ description: 'User level (0-1000)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  public user_level?: number;

  @ApiPropertyOptional({ description: 'Account enabled' })
  @IsOptional()
  @IsBoolean()
  public enabled?: boolean;
}

export class AdminDeleteAccountInputDTO {
  @ApiProperty({ description: 'Username to delete' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  public username!: string;
}

export class AdminKickPlayerInputDTO {
  @ApiProperty({ description: 'Username to kick' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  public username!: string;

  @ApiPropertyOptional({ description: 'Kick level (1-3)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  public kick_level?: number;
}

export class AdminMessageWorldInputDTO {
  @ApiProperty({ description: 'World ID' })
  @IsNotEmpty()
  @IsInt()
  public world_id!: number;

  @ApiProperty({ description: 'Message content' })
  @IsNotEmpty()
  @IsString()
  public message!: string;

  @ApiProperty({ description: 'Message type', enum: ['console', 'ticker'] })
  @IsNotEmpty()
  @IsString()
  public type!: 'console' | 'ticker';

  @ApiPropertyOptional({ description: 'Sender name (for console type)', default: 'SYSTEM' })
  @IsOptional()
  @IsString()
  public from?: string;

  @ApiPropertyOptional({ description: 'Mode (for ticker type)', default: 0 })
  @IsOptional()
  @IsInt()
  public mode?: number;

  @ApiPropertyOptional({ description: 'Sub mode (for ticker type)', default: 0 })
  @IsOptional()
  @IsInt()
  public sub_mode?: number;
}

export class AdminOnlineTargetInputDTO {
  @ApiProperty({ description: 'Target name' })
  @IsNotEmpty()
  @IsString()
  public name!: string;

  @ApiProperty({ description: 'Target type', enum: ['account', 'character'] })
  @IsNotEmpty()
  @IsString()
  public type!: 'account' | 'character';
}

export class AdminOnlineInputDTO {
  @ApiPropertyOptional({ description: 'Targets to check', type: [AdminOnlineTargetInputDTO] })
  @IsOptional()
  @IsArray()
  public targets?: AdminOnlineTargetInputDTO[];
}

export class AdminPostItemsInputDTO {
  @ApiProperty({ description: 'Username to post items to' })
  @IsNotEmpty()
  @IsString()
  public username!: string;

  @ApiPropertyOptional({ description: 'CP cost', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  public cp?: number;

  @ApiProperty({ description: 'Product IDs' })
  @IsNotEmpty()
  @IsArray()
  public products!: number[];
}

export class AdminCreatePromoInputDTO {
  @ApiProperty({ description: 'Promo code' })
  @IsNotEmpty()
  @IsString()
  public code!: string;

  @ApiProperty({ description: 'Start time (Unix timestamp)' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  public startTime!: number;

  @ApiProperty({ description: 'End time (Unix timestamp)' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  public endTime!: number;

  @ApiProperty({ description: 'Use limit (0-255)' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(255)
  public useLimit!: number;

  @ApiPropertyOptional({ description: 'Limit type', enum: ['account', 'character', 'world'], default: 'account' })
  @IsOptional()
  @IsString()
  public limitType?: 'account' | 'character' | 'world';

  @ApiProperty({ description: 'Product IDs' })
  @IsNotEmpty()
  @IsArray()
  public items!: number[];
}

export class AdminDeletePromoInputDTO {
  @ApiProperty({ description: 'Promo code to delete' })
  @IsNotEmpty()
  @IsString()
  public code!: string;
}
