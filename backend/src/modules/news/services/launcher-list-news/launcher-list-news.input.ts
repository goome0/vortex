import { Transform } from 'class-transformer';
import { IsOptional, IsInt, Max, Min } from 'class-validator';

export class LauncherListNewsInputDTO {
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  public limit?: number;
}
