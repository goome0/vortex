import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { EVtxCasePriority } from '@/database/entities/vtx-support-case.entity';

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

export class ResolveCaseInputDTO {
  @ApiPropertyOptional({ description: 'Resolution message', example: 'Issue fixed. Please try again.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  public message?: string;
}
