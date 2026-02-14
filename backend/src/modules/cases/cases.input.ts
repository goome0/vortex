import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { EVtxCasePriority } from '@/database/entities/vtx-support-case.entity';
import { EVtxCaseStatus } from '@/database/entities/vtx-support-case.entity';

export enum EVtxCaseCategory {
  ACCOUNT = 'ACCOUNT',
  BUG = 'BUG',
  REPORT = 'REPORT',
  OTHER = 'OTHER',
}

export class CreateCaseInputDTO {
  @ApiProperty({ description: 'Case subject', example: 'Cannot login to my account', maxLength: 140 })
  @IsNotEmpty({ message: 'Subject is required' })
  @IsString({ message: 'Subject must be a string' })
  @MaxLength(140, { message: 'Subject must be less than 140 characters' })
  public subject!: string;

  @ApiPropertyOptional({
    description: 'Category',
    enum: EVtxCaseCategory,
    example: EVtxCaseCategory.ACCOUNT,
  })
  @IsOptional()
  @IsEnum(EVtxCaseCategory, { message: 'Category is invalid' })
  public category?: EVtxCaseCategory;

  @ApiPropertyOptional({ description: 'Priority', enum: EVtxCasePriority, default: EVtxCasePriority.MEDIUM })
  @IsOptional()
  @IsEnum(EVtxCasePriority, { message: 'Priority is invalid' })
  public priority?: EVtxCasePriority;

  @ApiProperty({ description: 'Initial message body', example: 'I receive error XYZ when signing in.', minLength: 1 })
  @IsNotEmpty({ message: 'Message is required' })
  @IsString({ message: 'Message must be a string' })
  @MinLength(1, { message: 'Message must not be empty' })
  public message!: string;
}

export class AddCaseMessageInputDTO {
  @ApiProperty({ description: 'Message body', example: 'Any updates on this?', minLength: 1 })
  @IsNotEmpty({ message: 'Message is required' })
  @IsString({ message: 'Message must be a string' })
  @MinLength(1, { message: 'Message must not be empty' })
  public message!: string;
}

export class ListMyCasesQueryDTO {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  public q?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: EVtxCaseStatus })
  @IsOptional()
  @IsEnum(EVtxCaseStatus)
  public status?: EVtxCaseStatus;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  public page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 25, maximum: 50 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  public limit?: number;
}

export class ResolveCaseInputDTO {
  @ApiPropertyOptional({ description: 'Resolution message', example: 'Issue fixed. Please try again.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  public message?: string;
}

export class AdminListCasesQueryDTO {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  public q?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: EVtxCaseStatus })
  @IsOptional()
  @IsEnum(EVtxCaseStatus)
  public status?: EVtxCaseStatus;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  public page?: number;

  @ApiPropertyOptional({ description: 'Page size', default: 25, maximum: 50 })
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  public limit?: number;
}
