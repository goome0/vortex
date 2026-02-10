import { RequireAdmin } from '@/common/decorators';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { CurrentUser } from '@/common/decorators';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { GetAccountsService } from './services/get-accounts/get-accounts.service';
import { GetAccountService } from './services/get-account/get-account.service';
import { UpdateAccountService } from './services/update-account/update-account.service';
import { DeleteAccountService } from './services/delete-account/delete-account.service';
import { KickPlayerService } from './services/kick-player/kick-player.service';
import { MessageWorldService } from './services/message-world/message-world.service';
import { OnlineService } from './services/online/online.service';
import { PostItemsService } from './services/post-items/post-items.service';
import { GetPromosService } from './services/get-promos/get-promos.service';
import { CreatePromoService } from './services/create-promo/create-promo.service';
import { DeletePromoService } from './services/delete-promo/delete-promo.service';
import {
  AdminGetAccountInputDTO,
  AdminUpdateAccountInputDTO,
  AdminDeleteAccountInputDTO,
  AdminKickPlayerInputDTO,
  AdminMessageWorldInputDTO,
  AdminOnlineInputDTO,
  AdminPostItemsInputDTO,
  AdminCreatePromoInputDTO,
  AdminDeletePromoInputDTO,
} from './admin.input';

@Controller('admin')
@RequireAdmin()
export class AdminController {
  public constructor(
    private readonly getAccountsService: GetAccountsService,
    private readonly getAccountService: GetAccountService,
    private readonly updateAccountService: UpdateAccountService,
    private readonly deleteAccountService: DeleteAccountService,
    private readonly kickPlayerService: KickPlayerService,
    private readonly messageWorldService: MessageWorldService,
    private readonly onlineService: OnlineService,
    private readonly postItemsService: PostItemsService,
    private readonly getPromosService: GetPromosService,
    private readonly createPromoService: CreatePromoService,
    private readonly deletePromoService: DeletePromoService,
  ) {}

  @Get('accounts')
  public async getAccounts(@CurrentUser() currentUser: CurrentUserDTO) {
    return this.getAccountsService.execute(currentUser);
  }

  @Post('account')
  public async getAccount(@Body() input: AdminGetAccountInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.getAccountService.execute(input, currentUser);
  }

  @Post('account/update')
  public async updateAccount(@Body() input: AdminUpdateAccountInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.updateAccountService.execute(input, currentUser);
  }

  @Post('account/delete')
  public async deleteAccount(@Body() input: AdminDeleteAccountInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.deleteAccountService.execute(input, currentUser);
  }

  @Post('kick-player')
  public async kickPlayer(@Body() input: AdminKickPlayerInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.kickPlayerService.execute(input, currentUser);
  }

  @Post('message-world')
  public async messageWorld(@Body() input: AdminMessageWorldInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.messageWorldService.execute(input, currentUser);
  }

  @Post('online')
  public async online(@Body() input: AdminOnlineInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.onlineService.execute(input, currentUser);
  }

  @Post('post-items')
  public async postItems(@Body() input: AdminPostItemsInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.postItemsService.execute(input, currentUser);
  }

  @Get('promos')
  public async getPromos(@CurrentUser() currentUser: CurrentUserDTO) {
    return this.getPromosService.execute(currentUser);
  }

  @Post('promo/create')
  public async createPromo(@Body() input: AdminCreatePromoInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.createPromoService.execute(input, currentUser);
  }

  @Post('promo/delete')
  public async deletePromo(@Body() input: AdminDeletePromoInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.deletePromoService.execute(input, currentUser);
  }
}
