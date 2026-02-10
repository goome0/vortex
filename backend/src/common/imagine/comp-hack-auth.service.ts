import { ErrorResponse } from '@/common/responses/error-response';
import { CompHackEntities } from '@/database/entities';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { ImagineService } from './imagine.service';

@Injectable()
export class CompHackAuthService {
  public constructor(
    private readonly imagineService: ImagineService,
    @InjectRepository(CompHackEntities.Account)
    private readonly accountRepository: Repository<CompHackEntities.Account>,
  ) {}

  private sha512Hex(input: string): string {
    return createHash('sha512').update(input).digest('hex');
  }

  private async getPasswordHashOrThrow(username: string): Promise<string> {
    const account = await this.accountRepository.findOne({
      where: { username },
    });

    if (!account?.password) {
      throw ErrorResponse.toHttpException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
        code: 'USER_NOT_FOUND',
      });
    }

    return account.password;
  }

  /**
   * Returns an authenticated `{ session_username, challenge }` pair for a single request
   * against the comp_hack WebAPI.
   *
   * It calls `/auth/get_challenge` to (re)create the server-side session and then
   * computes the correct challenge reply using the password hash stored in DB.
   */
  public async getSession(usernameInput: string): Promise<{ session_username: string; challenge: string }> {
    const username = usernameInput.trim().toLowerCase();

    const [challengeResponse, passwordHash] = await Promise.all([
      this.imagineService.getChallenge({ username }),
      this.getPasswordHashOrThrow(username),
    ]);

    if (!challengeResponse.challenge) {
      throw ErrorResponse.toHttpException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
        code: 'USER_NOT_FOUND',
      });
    }

    const challengeReply = this.sha512Hex(`${passwordHash}${challengeResponse.challenge}`);
    return { session_username: username, challenge: challengeReply };
  }

  public async getWebGameSession(
    usernameInput: string,
    clientVersion = '1.666',
  ): Promise<{ username: string; sessionid: string }> {
    const username = usernameInput.trim().toLowerCase();
    const session = await this.getSession(username);

    const login = await this.imagineService.clientLogin({
      ...session,
      client_version: clientVersion,
    });

    const isSuccess = login.error_code === 0 && !!login.sid1;
    if (!isSuccess) {
      throw ErrorResponse.toHttpException({
        message: login.error || 'Failed to create webgame session',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'WEBGAME_SESSION_FAILED',
      });
    }

    return { username, sessionid: login.sid1 };
  }
}

