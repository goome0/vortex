import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

import {
  ImagineChangePasswordDTO,
  ImagineChangePasswordResponseDTO,
  ImagineClientLoginDTO,
  ImagineClientLoginResponseDTO,
  ImagineGetCPResponseDTO,
  ImagineGetDetailsResponseDTO,
} from './dto/imagine-account.dto';
import {
  ImagineAdminCreatePromoDTO,
  ImagineAdminDeleteAccountDTO,
  ImagineAdminDeletePromoDTO,
  ImagineAdminErrorResponseDTO,
  ImagineAdminGetAccountDTO,
  ImagineAdminGetAccountResponseDTO,
  ImagineAdminGetAccountsResponseDTO,
  ImagineAdminGetPromosResponseDTO,
  ImagineAdminKickPlayerDTO,
  ImagineAdminMessageWorldDTO,
  ImagineAdminOnlineDTO,
  ImagineAdminOnlineResponseDTO,
  ImagineAdminPostItemsDTO,
  ImagineAdminPostItemsResponseDTO,
  ImagineAdminUpdateAccountDTO,
} from './dto/imagine-admin.dto';
import { ImagineGetChallengeDTO, ImagineGetChallengeResponseDTO } from './dto/imagine-get-challenge.dto';
import { ImagineSessionDTO } from './dto/imagine-session.dto';
import { ImagineSignUpDTO } from './dto/imagine-sign-up.dto';
import {
  ImagineWebGameGetCoinsResponseDTO,
  ImagineWebGameSessionDTO,
  ImagineWebGameStartDTO,
  ImagineWebGameStartResponseDTO,
  ImagineWebGameUpdateDTO,
  ImagineWebGameUpdateResponseDTO,
} from './dto/imagine-webgame.dto';
import { EImagineRoutes } from './imagine.interface';

@Injectable()
export class ImagineService {
  private readonly imagineApi: string;

  public constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.imagineApi = this.configService.getOrThrow<string>('IMAGINE_API');
  }

  private async post<T>(route: EImagineRoutes, body: object): Promise<T> {
    const url = `${this.imagineApi}${route}`;
    const response = await lastValueFrom(this.httpService.post<T>(url, body));
    return response.data;
  }

  // --- Auth ---

  public async getChallenge(input: ImagineGetChallengeDTO) {
    return this.post<ImagineGetChallengeResponseDTO>(EImagineRoutes.GET_CHALLENGE, input);
  }

  // --- Account ---

  public async register(input: ImagineSignUpDTO) {
    return this.post<{ error: string }>(EImagineRoutes.REGISTER, input);
  }

  public async getCP(input: ImagineSessionDTO) {
    return this.post<ImagineGetCPResponseDTO>(EImagineRoutes.GET_CP, input);
  }

  public async getDetails(input: ImagineSessionDTO) {
    return this.post<ImagineGetDetailsResponseDTO>(EImagineRoutes.GET_DETAILS, input);
  }

  public async changePassword(input: ImagineChangePasswordDTO) {
    return this.post<ImagineChangePasswordResponseDTO>(EImagineRoutes.CHANGE_PASSWORD, input);
  }

  public async clientLogin(input: ImagineClientLoginDTO) {
    return this.post<ImagineClientLoginResponseDTO>(EImagineRoutes.CLIENT_LOGIN, input);
  }

  // --- Admin ---

  public async getAccounts(input: ImagineSessionDTO) {
    return this.post<ImagineAdminGetAccountsResponseDTO>(EImagineRoutes.GET_ACCOUNTS, input);
  }

  public async getAccount(input: ImagineAdminGetAccountDTO) {
    return this.post<ImagineAdminGetAccountResponseDTO>(EImagineRoutes.GET_ACCOUNT, input);
  }

  public async updateAccount(input: ImagineAdminUpdateAccountDTO) {
    return this.post<ImagineAdminErrorResponseDTO>(EImagineRoutes.UPDATE_ACCOUNT, input);
  }

  public async deleteAccount(input: ImagineAdminDeleteAccountDTO) {
    return this.post<ImagineAdminErrorResponseDTO>(EImagineRoutes.DELETE_ACCOUNT, input);
  }

  public async kickPlayer(input: ImagineAdminKickPlayerDTO) {
    return this.post<ImagineAdminErrorResponseDTO>(EImagineRoutes.KICK_PLAYER, input);
  }

  public async messageWorld(input: ImagineAdminMessageWorldDTO) {
    return this.post<ImagineAdminErrorResponseDTO>(EImagineRoutes.MESSAGE_WORLD, input);
  }

  public async getOnline(input: ImagineAdminOnlineDTO) {
    return this.post<ImagineAdminOnlineResponseDTO>(EImagineRoutes.ONLINE, input);
  }

  public async postItems(input: ImagineAdminPostItemsDTO) {
    return this.post<ImagineAdminPostItemsResponseDTO>(EImagineRoutes.POST_ITEMS, input);
  }

  public async getPromos(input: ImagineSessionDTO) {
    return this.post<ImagineAdminGetPromosResponseDTO>(EImagineRoutes.GET_PROMOS, input);
  }

  public async createPromo(input: ImagineAdminCreatePromoDTO) {
    return this.post<ImagineAdminErrorResponseDTO>(EImagineRoutes.CREATE_PROMO, input);
  }

  public async deletePromo(input: ImagineAdminDeletePromoDTO) {
    return this.post<ImagineAdminErrorResponseDTO>(EImagineRoutes.DELETE_PROMO, input);
  }

  // --- WebGame ---

  public async getWebGameCoins(input: ImagineWebGameSessionDTO) {
    return this.post<ImagineWebGameGetCoinsResponseDTO>(EImagineRoutes.WEBGAME_GET_COINS, input);
  }

  public async startWebGame(input: ImagineWebGameStartDTO) {
    return this.post<ImagineWebGameStartResponseDTO>(EImagineRoutes.WEBGAME_START, input);
  }

  public async updateWebGame(input: ImagineWebGameUpdateDTO) {
    return this.post<ImagineWebGameUpdateResponseDTO>(EImagineRoutes.WEBGAME_UPDATE, input);
  }
}
