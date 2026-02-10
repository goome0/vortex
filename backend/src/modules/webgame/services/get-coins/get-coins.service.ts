import { ImagineService } from '@/common/imagine/imagine.service';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { isAxiosError } from 'axios';

@Injectable()
export class GetCoinsService {
  private readonly logger = new Logger(GetCoinsService.name);

  public constructor(
    private readonly imagineService: ImagineService,
  ) {}

  public async execute(currentUser: CurrentUserDTO) {
    this.logger.log(`Getting webgame coins for ${currentUser.username}`);

    const response = await (async () => {
      try {
        return await this.imagineService.getWebGameCoins({
          username: currentUser.username,
          sessionid: currentUser.challenge,
        });
      } catch (error: unknown) {
        if (isAxiosError(error) && error.response?.status === 401) {
          throw ErrorResponse.toHttpException({
            message: 'No active webgame session for this account',
            statusCode: HttpStatus.UNAUTHORIZED,
            code: 'WEBGAME_NOT_AUTHORIZED',
          });
        }
        throw error;
      }
    })();

    return SuccessResponse.toJson({
      code: 'GET_COINS_SUCCESS',
      message: 'Coins retrieved successfully',
      path: '/webgame/coins',
      data: response,
    });
  }
}
