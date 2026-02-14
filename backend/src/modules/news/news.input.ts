import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EVtxNewsBadgeVariant } from '@/database/entities/vtx-news.entity';

export class PublicListNewsQueryDTO {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  public q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(48)
  public category?: string;

  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  public page?: number;

  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  public limit?: number;
}

export class AdminListNewsInputDTO {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  public q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(48)
  public category?: string;

  @IsOptional()
  @IsBoolean()
  public onlyPublished?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  public page?: number;

  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(200)
  public limit?: number;
}

export class AdminCreateNewsInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  public title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(96)
  public slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  public excerpt?: string;

  @IsOptional()
  @IsString()
  public content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(48)
  public category?: string;

  @IsOptional()
  @IsEnum(EVtxNewsBadgeVariant)
  public badgeVariant?: EVtxNewsBadgeVariant;

  @IsOptional()
  @IsBoolean()
  public featured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  public readTime?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  public imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  public isPublished?: boolean;
}

export class AdminUpdateNewsInputDTO {
  @IsUUID()
  public id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  public title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(96)
  public slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  public excerpt?: string | null;

  @IsOptional()
  @IsString()
  public content?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(48)
  public category?: string | null;

  @IsOptional()
  @IsEnum(EVtxNewsBadgeVariant)
  public badgeVariant?: EVtxNewsBadgeVariant;

  @IsOptional()
  @IsBoolean()
  public featured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  public readTime?: string | null;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  public imageUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  public isPublished?: boolean;
}

export class AdminDeleteNewsInputDTO {
  @IsUUID()
  public id!: string;
}
