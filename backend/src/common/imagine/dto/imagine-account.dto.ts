import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ImagineSessionDTO } from './imagine-session.dto';

export class ImagineChangePasswordDTO extends ImagineSessionDTO {
  @ApiProperty({ description: 'New password', example: 'P@ssw0rd123' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MaxLength(16, { message: 'Password must be less than 16 characters' })
  public password!: string;
}

export class ImagineClientLoginDTO extends ImagineSessionDTO {
  @ApiProperty({ description: 'Client version', example: '1.0' })
  @IsNotEmpty({ message: 'Client version is required' })
  @IsString({ message: 'Client version must be a string' })
  public client_version!: string;
}

export class ImagineGetCPResponseDTO {
  public cp!: number;
  public challenge!: string;
}

export class ImagineGetDetailsResponseDTO {
  public cp!: number;
  public username!: string;
  public disp_name!: string;
  public email!: string;
  public ticket_count!: number;
  public user_level!: number;
  public enabled!: boolean;
  public last_login!: number;
  public ban_reason!: string;
  public ban_initiator!: string;
  public character_count!: number;
  public challenge!: string;
}

export class ImagineChangePasswordResponseDTO {
  public error!: string;
  public challenge!: string;
}

export class ImagineClientLoginResponseDTO {
  public error!: string;
  public error_code!: number;
  public sid1?: string;
  public sid2?: string;
  public challenge!: string;
}
