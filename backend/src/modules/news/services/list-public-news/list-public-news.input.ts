import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsInt, Max, MaxLength, Min } from 'class-validator';

export class ListPublicNewsInputDTO {
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
