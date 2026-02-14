import { CompHackAuthService } from '@/common/imagine/comp-hack-auth.service';
import { ImagineService } from '@/common/imagine/imagine.service';
import { ErrorResponse } from '@/common/responses/error-response';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CpGrantService {
  private readonly logger = new Logger(CpGrantService.name);

  public constructor(
    private readonly imagineService: ImagineService,
    private readonly compHackAuthService: CompHackAuthService,
  ) {}

  public async addCp(params: {
    username: string;
    amount: number;
    requestedByUsername: string;
    /** Override for comp_hack auth (e.g. service account). If set, used for getSession instead of requestedByUsername. */
    authUsername?: string;
  }): Promise<{ previousCp: number; newCp: number }> {
    const username = params.username.trim().toLowerCase();
    const requestedByUsername = params.requestedByUsername.trim().toLowerCase();
    const authUsername = params.authUsername?.trim().toLowerCase() || requestedByUsername;

    this.logger.log(
      `Adding CP to account ${username} (+${params.amount}) - requested by ${requestedByUsername}` +
        (authUsername !== requestedByUsername ? ` [auth: ${authUsername}]` : ''),
    );

    const session = await this.compHackAuthService.getSession(authUsername);

    const account = await this.imagineService.getAccount({
      ...session,
      username,
    });

    const currentCp = Number(account.cp ?? 0);
    if (!Number.isFinite(currentCp) || currentCp < 0) {
      throw ErrorResponse.toHttpException({
        message: 'Invalid CP value for account',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'INVALID_CP_VALUE',
      });
    }

    const newCp = currentCp + params.amount;

    await this.imagineService.updateAccount({
      ...session,
      username,
      cp: newCp,
    });

    return { previousCp: currentCp, newCp };
  }
}

