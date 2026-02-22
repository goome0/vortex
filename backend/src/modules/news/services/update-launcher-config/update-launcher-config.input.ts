import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateLauncherConfigInputDTO {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  public heroSubtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  public heroSubtitleColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  public heroTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  public heroDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  public playButtonBackground?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  public playButtonHoverBackground?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  public playButtonTextColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  public backgroundUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  public backgroundAlt?: string;
}
