import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { ImagineService } from '@/common/imagine/imagine.service';
import { SuccessResponse } from '@/common/responses/success-response';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GetProfileService {
  private readonly logger = new Logger(GetProfileService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async execute(currentUser: CurrentUserDTO) {
    this.logger.log('Executing get profile service');

    const session = await this.compHackAuthService.getSession(currentUser.username);
    const details = await this.imagineService.getDetails(session);

    return SuccessResponse.toJson({
      code: 'GET_PROFILE_SUCCESS',
      message: 'Profile retrieved successfully',
      path: '/auth/profile',
      data: {
        username: details.username,
        email: details.email,
        disp_name: details.disp_name,
        cp: details.cp,
        ticket_count: details.ticket_count,
        user_level: details.user_level,
        enabled: details.enabled,
        last_login: details.last_login,
        character_count: details.character_count,
      },
      successCode: HttpStatus.OK,
    });
  }
}
