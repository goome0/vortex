import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { EVtxNewsBadgeVariant } from '@/database/entities/vtx-news.entity';

export class UpdateNewsInputDTO {
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
  public contentHtml?: string | null;

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
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  public cardImageUrl?: string | null;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  public heroImageUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  public isPublished?: boolean;
}
