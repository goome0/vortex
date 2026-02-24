import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListAdminNewsInputDTO {
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
  @IsBoolean()
  public published?: boolean;

  @IsOptional()
  @IsBoolean()
  public featured?: boolean;

  @IsOptional()
  @IsIn(['default', 'info', 'warning', 'danger'])
  public badgeVariant?: 'default' | 'info' | 'warning' | 'danger';

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
