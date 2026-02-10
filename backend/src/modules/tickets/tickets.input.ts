import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { EVtxTicketPriority } from '@/database/entities/vtx-support-ticket.entity';

export enum EVtxTicketCategory {
  ACCOUNT = 'ACCOUNT',
  BUG = 'BUG',
  REPORT = 'REPORT',
  OTHER = 'OTHER',
}

export class CreateTicketInputDTO {
  @ApiProperty({ description: 'Ticket subject', example: 'Cannot login to my account', maxLength: 140 })
  @IsNotEmpty({ message: 'Subject is required' })
  @IsString({ message: 'Subject must be a string' })
  @MaxLength(140, { message: 'Subject must be less than 140 characters' })
  public subject!: string;

  @ApiPropertyOptional({
    description: 'Category',
    enum: EVtxTicketCategory,
    example: EVtxTicketCategory.ACCOUNT,
  })
  @IsOptional()
  @IsEnum(EVtxTicketCategory, { message: 'Category is invalid' })
  public category?: EVtxTicketCategory;

  @ApiPropertyOptional({ description: 'Priority', enum: EVtxTicketPriority, default: EVtxTicketPriority.MEDIUM })
  @IsOptional()
  @IsEnum(EVtxTicketPriority, { message: 'Priority is invalid' })
  public priority?: EVtxTicketPriority;

  @ApiProperty({ description: 'Initial message body', example: 'I receive error XYZ when signing in.', minLength: 1 })
  @IsNotEmpty({ message: 'Message is required' })
  @IsString({ message: 'Message must be a string' })
  @MinLength(1, { message: 'Message must not be empty' })
  public message!: string;
}

export class AddTicketMessageInputDTO {
  @ApiProperty({ description: 'Message body', example: 'Any updates on this?', minLength: 1 })
  @IsNotEmpty({ message: 'Message is required' })
  @IsString({ message: 'Message must be a string' })
  @MinLength(1, { message: 'Message must not be empty' })
  public message!: string;
}

export class ResolveTicketInputDTO {
  @ApiPropertyOptional({ description: 'Resolution message', example: 'Issue fixed. Please try again.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  public message?: string;
}

