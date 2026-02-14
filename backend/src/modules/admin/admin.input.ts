import { EVtxScheduledCpStatus } from '@/database/entities/vtx-scheduled-cp-grant.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class AdminPaginationInputDTO {
  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  public page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 50, maximum: 200 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(200)
  public limit?: number;
}

export class AdminSearchablePaginationInputDTO extends AdminPaginationInputDTO {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  public q?: string;
}

export class AdminGetAccountInputDTO {
  @ApiProperty({ description: 'Username to fetch' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  public username!: string;
}

export class AdminLookupAccountByCharacterNameInputDTO {
  @ApiProperty({ description: 'Character name (partial match, case-insensitive)' })
  @IsNotEmpty({ message: 'Character name is required' })
  @IsString({ message: 'Character name must be a string' })
  @MaxLength(64)
  public characterName!: string;
}

export class AdminListAccountCharactersInputDTO {
  @ApiProperty({ description: 'Account username' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  public username!: string;
}

export class AdminUpdateAccountCharacterInputDTO {
  @ApiProperty({ description: 'Account username' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  public username!: string;

  @ApiProperty({ description: 'Character UID' })
  @IsNotEmpty()
  @IsUUID()
  public characterUid!: string;

  @ApiPropertyOptional({ description: 'Points (overwrites current)', minimum: 0, maximum: 2000000000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2000000000)
  public points?: number;

  @ApiPropertyOptional({
    description: 'Character name (must be unique globally)',
    minLength: 1,
    maxLength: 32,
    example: 'My_Character-01',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @Matches(/^[A-Za-z0-9_-]+$/, { message: 'Character name contains invalid characters' })
  public name?: string;

  @ApiPropertyOptional({
    description: 'LNC (alignment) (overwrites current)',
    minimum: -2000000000,
    maximum: 2000000000,
  })
  @IsOptional()
  @IsInt()
  @Min(-2000000000)
  @Max(2000000000)
  public lnc?: number;

  @ApiPropertyOptional({ description: 'Login points (overwrites current)', minimum: 0, maximum: 2000000000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2000000000)
  public loginPoints?: number;

  @ApiPropertyOptional({ description: 'Revive character (sets KillTime = 0)', default: false })
  @IsOptional()
  @IsBoolean()
  public revive?: boolean;
}

export class AdminListAccountsQueryDTO extends AdminSearchablePaginationInputDTO {}

export class AdminListPromosQueryDTO extends AdminSearchablePaginationInputDTO {}

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

export class AdminAddCpInputDTO {
  @ApiProperty({ description: 'Username to add CP to' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  public username!: string;

  @ApiProperty({ description: 'CP amount to add (positive integer)', example: 100 })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsInt({ message: 'Amount must be an integer' })
  @Min(1, { message: 'Amount must be at least 1' })
  @Max(2000000000, { message: 'Amount is too large' })
  public amount!: number;

  @ApiPropertyOptional({ description: 'Optional reason / note', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  public reason?: string;
}

export class AdminScheduleCpInputDTO {
  @ApiProperty({ description: 'Username to add CP to' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  public username!: string;

  @ApiProperty({ description: 'CP amount to add (positive integer)', example: 100 })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsInt({ message: 'Amount must be an integer' })
  @Min(1, { message: 'Amount must be at least 1' })
  @Max(2000000000, { message: 'Amount is too large' })
  public amount!: number;

  @ApiProperty({
    description: 'When to send CP (Unix timestamp in milliseconds)',
    example: 1700000000000,
  })
  @IsNotEmpty({ message: 'Scheduled time is required' })
  @IsInt({ message: 'Scheduled time must be an integer' })
  @Min(1)
  public scheduledAtMs!: number;

  @ApiPropertyOptional({ description: 'Optional reason / note', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  public reason?: string;
}

export class AdminListScheduledCpInputDTO {
  @ApiPropertyOptional({ description: 'Filter by username' })
  @IsOptional()
  @IsString()
  public username?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: EVtxScheduledCpStatus })
  @IsOptional()
  @IsString()
  public status?: EVtxScheduledCpStatus;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  public page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 50, maximum: 200 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(200)
  public limit?: number;
}

export class AdminCancelScheduledCpInputDTO {
  @ApiProperty({ description: 'Scheduled grant ID to cancel' })
  @IsNotEmpty()
  @IsUUID()
  public id!: string;
}

export class AdminUpdateScheduledCpInputDTO {
  @ApiProperty({ description: 'Scheduled grant ID to update' })
  @IsNotEmpty()
  @IsUUID()
  public id!: string;

  @ApiPropertyOptional({ description: 'CP amount to add (positive integer)', example: 100 })
  @IsOptional()
  @IsInt({ message: 'Amount must be an integer' })
  @Min(1, { message: 'Amount must be at least 1' })
  @Max(2000000000, { message: 'Amount is too large' })
  public amount?: number;

  @ApiPropertyOptional({
    description: 'When to send CP (Unix timestamp in milliseconds)',
    example: 1700000000000,
  })
  @IsOptional()
  @IsInt({ message: 'Scheduled time must be an integer' })
  @Min(1)
  public scheduledAtMs?: number;

  @ApiPropertyOptional({
    description: 'Optional reason / note. Send empty string to clear.',
    maxLength: 140,
  })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  public reason?: string;
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
  @Min(0)
  @Max(127)
  public mode?: number;

  @ApiPropertyOptional({ description: 'Sub mode (for ticker type)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(127)
  public sub_mode?: number;
}

export class AdminOnlineTargetInputDTO {
  @ApiProperty({ description: 'Target name (username for account, character name for character)' })
  @IsNotEmpty()
  @IsString()
  public name!: string;

  @ApiProperty({ description: 'Target type', enum: ['account', 'character'] })
  @IsNotEmpty()
  @IsString()
  public type!: 'account' | 'character';

  @ApiPropertyOptional({ description: 'World ID (required for type=character, used to look up character by name)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  public world_id?: number;
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

// --- Item Bundles ---

export class AdminCreateItemBundleInputDTO {
  @ApiProperty({ description: 'Bundle name', maxLength: 64 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  public name!: string;

  @ApiPropertyOptional({ description: 'Bundle description', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  public description?: string;

  @ApiPropertyOptional({ description: 'CP cost (0 = free)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  public cpCost?: number;

  @ApiProperty({ description: 'Product IDs', type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  public products!: number[];
}

export class AdminUpdateItemBundleInputDTO {
  @ApiProperty({ description: 'Bundle ID' })
  @IsNotEmpty()
  @IsUUID()
  public id!: string;

  @ApiPropertyOptional({ description: 'Bundle name', maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  public name?: string;

  @ApiPropertyOptional({ description: 'Bundle description', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  public description?: string;

  @ApiPropertyOptional({ description: 'CP cost (0 = free)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  public cpCost?: number;

  @ApiPropertyOptional({ description: 'Product IDs', type: [Number] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  public products?: number[];
}

export class AdminDeleteItemBundleInputDTO {
  @ApiProperty({ description: 'Bundle ID' })
  @IsNotEmpty()
  @IsUUID()
  public id!: string;
}

export class AdminListItemBundlesInputDTO {
  @ApiPropertyOptional({ description: 'Search by name (contains)' })
  @IsOptional()
  @IsString()
  public q?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  public page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 50, maximum: 200 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(200)
  public limit?: number;
}

export class AdminScheduleItemBundleSendInputDTO {
  @ApiProperty({ description: 'Bundle ID' })
  @IsNotEmpty()
  @IsUUID()
  public bundleId!: string;

  @ApiProperty({ description: 'Usernames to receive this bundle', type: [String] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  public usernames!: string[];

  @ApiPropertyOptional({
    description: 'When to send (Unix timestamp in milliseconds). If omitted, send ASAP.',
    example: 1700000000000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  public scheduledAtMs?: number;

  @ApiPropertyOptional({ description: 'Optional reason / note', maxLength: 140 })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  public reason?: string;
}

export class AdminListItemBundleSendsInputDTO {
  @ApiPropertyOptional({ description: 'Filter by bundleId' })
  @IsOptional()
  @IsUUID()
  public bundleId?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  public page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 50, maximum: 200 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(200)
  public limit?: number;
}

export class AdminCancelItemBundleSendInputDTO {
  @ApiProperty({ description: 'Send batch ID to cancel' })
  @IsNotEmpty()
  @IsUUID()
  public id!: string;
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

export class AdminDeleteManyPromosInputDTO {
  @ApiProperty({ description: 'Promo codes to delete', type: [String] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => (typeof v === 'string' ? v.trim() : String(v))) : value,
  )
  public codes!: string[];
}

export class AdminDeleteAllPromosInputDTO {
  @ApiProperty({ description: 'Must be true to confirm this destructive action', example: true })
  @IsNotEmpty()
  @IsBoolean()
  public confirm!: boolean;
}
