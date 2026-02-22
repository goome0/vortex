import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsInt, Max, MaxLength, Min } from 'class-validator';

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
