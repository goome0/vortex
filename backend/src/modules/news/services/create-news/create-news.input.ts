import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { EVtxNewsBadgeVariant } from '@/database/entities/vtx-news.entity';

export class CreateNewsInputDTO {
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
  public contentHtml?: string;

  @IsOptional()
  @IsString()
  @MaxLength(48)
  public category?: string;

  @IsOptional()
  @IsEnum(EVtxNewsBadgeVariant)
  public badgeVariant?: EVtxNewsBadgeVariant;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  public badgeColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  public badgeTextColor?: string;

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
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  public cardImageUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  public heroImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  public isPublished?: boolean;
}
