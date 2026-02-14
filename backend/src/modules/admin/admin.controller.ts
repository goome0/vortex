import { RequireAdmin } from '@/common/decorators';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { CurrentUser } from '@/common/decorators';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GetAccountsService } from './services/get-accounts/get-accounts.service';
import { GetAccountService } from './services/get-account/get-account.service';
import { UpdateAccountService } from './services/update-account/update-account.service';
import { AddCpService } from './services/add-cp/add-cp.service';
import { ScheduleCpService } from './services/scheduled-cp/services/schedule-cp.service';
import { ListScheduledCpService } from './services/scheduled-cp/services/list-scheduled-cp.service';
import { CancelScheduledCpService } from './services/scheduled-cp/services/cancel-scheduled-cp.service';
import { UpdateScheduledCpService } from './services/scheduled-cp/services/update-scheduled-cp.service';
import { DeleteAccountService } from './services/delete-account/delete-account.service';
import { KickPlayerService } from './services/kick-player/kick-player.service';
import { MessageWorldService } from './services/message-world/message-world.service';
import { GetWorldsService } from './services/get-worlds/get-worlds.service';
import { OnlineService } from './services/online/online.service';
import { PostItemsService } from './services/post-items/post-items.service';
import { GetPromosService } from './services/get-promos/get-promos.service';
import { GetPromoInsightsService } from './services/get-promo-insights/get-promo-insights.service';
import { CreatePromoService } from './services/create-promo/create-promo.service';
import { DeletePromoService } from './services/delete-promo/delete-promo.service';
import { DeleteAllPromosService } from './services/promo-bulk-delete/delete-all-promos.service';
import { DeleteManyPromosService } from './services/promo-bulk-delete/delete-many-promos.service';
import { ListAccountCharactersService } from './services/account-characters/list-account-characters.service';
import { UpdateAccountCharacterService } from './services/account-characters/update-account-character.service';
import { CreateItemBundleService } from './services/item-bundles/services/create-item-bundle.service';
import { ListItemBundlesService } from './services/item-bundles/services/list-item-bundles.service';
import { UpdateItemBundleService } from './services/item-bundles/services/update-item-bundle.service';
import { DeleteItemBundleService } from './services/item-bundles/services/delete-item-bundle.service';
import { ScheduleItemBundleSendService } from './services/item-bundles/services/schedule-item-bundle-send.service';
import { ListItemBundleSendsService } from './services/item-bundles/services/list-item-bundle-sends.service';
import { CancelItemBundleSendService } from './services/item-bundles/services/cancel-item-bundle-send.service';
import {
  AdminGetAccountInputDTO,
  AdminUpdateAccountInputDTO,
  AdminAddCpInputDTO,
  AdminScheduleCpInputDTO,
  AdminListScheduledCpInputDTO,
  AdminCancelScheduledCpInputDTO,
  AdminUpdateScheduledCpInputDTO,
  AdminDeleteAccountInputDTO,
  AdminKickPlayerInputDTO,
  AdminMessageWorldInputDTO,
  AdminOnlineInputDTO,
  AdminPostItemsInputDTO,
  AdminCreateItemBundleInputDTO,
  AdminListItemBundlesInputDTO,
  AdminUpdateItemBundleInputDTO,
  AdminDeleteItemBundleInputDTO,
  AdminScheduleItemBundleSendInputDTO,
  AdminListItemBundleSendsInputDTO,
  AdminCancelItemBundleSendInputDTO,
  AdminCreatePromoInputDTO,
  AdminDeletePromoInputDTO,
  AdminDeleteManyPromosInputDTO,
  AdminDeleteAllPromosInputDTO,
  AdminListAccountsQueryDTO,
  AdminListPromosQueryDTO,
  AdminListAccountCharactersInputDTO,
  AdminUpdateAccountCharacterInputDTO,
} from './admin.input';

@Controller('admin')
@RequireAdmin()
export class AdminController {
  public constructor(
    private readonly getAccountsService: GetAccountsService,
    private readonly getAccountService: GetAccountService,
    private readonly updateAccountService: UpdateAccountService,
    private readonly addCpService: AddCpService,
    private readonly scheduleCpService: ScheduleCpService,
    private readonly listScheduledCpService: ListScheduledCpService,
    private readonly cancelScheduledCpService: CancelScheduledCpService,
    private readonly updateScheduledCpService: UpdateScheduledCpService,
    private readonly deleteAccountService: DeleteAccountService,
    private readonly kickPlayerService: KickPlayerService,
    private readonly messageWorldService: MessageWorldService,
    private readonly getWorldsService: GetWorldsService,
    private readonly onlineService: OnlineService,
    private readonly postItemsService: PostItemsService,
    private readonly createItemBundleService: CreateItemBundleService,
    private readonly listItemBundlesService: ListItemBundlesService,
    private readonly updateItemBundleService: UpdateItemBundleService,
    private readonly deleteItemBundleService: DeleteItemBundleService,
    private readonly scheduleItemBundleSendService: ScheduleItemBundleSendService,
    private readonly listItemBundleSendsService: ListItemBundleSendsService,
    private readonly cancelItemBundleSendService: CancelItemBundleSendService,
    private readonly getPromosService: GetPromosService,
    private readonly getPromoInsightsService: GetPromoInsightsService,
    private readonly createPromoService: CreatePromoService,
    private readonly deletePromoService: DeletePromoService,
    private readonly deleteManyPromosService: DeleteManyPromosService,
    private readonly deleteAllPromosService: DeleteAllPromosService,
    private readonly listAccountCharactersService: ListAccountCharactersService,
    private readonly updateAccountCharacterService: UpdateAccountCharacterService,
  ) {}

  @Get('accounts')
  public async getAccounts(
    @Query() query: AdminListAccountsQueryDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.getAccountsService.execute(currentUser, query);
  }

  @Get('worlds')
  public async getWorlds(@CurrentUser() currentUser: CurrentUserDTO) {
    return this.getWorldsService.execute(currentUser);
  }

  @Post('account')
  public async getAccount(@Body() input: AdminGetAccountInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.getAccountService.execute(input, currentUser);
  }

  @Post('account/update')
  public async updateAccount(@Body() input: AdminUpdateAccountInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.updateAccountService.execute(input, currentUser);
  }

  @Post('account/add-cp')
  public async addCp(@Body() input: AdminAddCpInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.addCpService.execute(input, currentUser);
  }

  @Post('account/schedule-cp')
  public async scheduleCp(@Body() input: AdminScheduleCpInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.scheduleCpService.execute(input, currentUser);
  }

  @Post('account/scheduled-cp')
  public async listScheduledCp(@Body() input: AdminListScheduledCpInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.listScheduledCpService.execute(input, currentUser);
  }

  @Post('account/scheduled-cp/cancel')
  public async cancelScheduledCp(@Body() input: AdminCancelScheduledCpInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.cancelScheduledCpService.execute(input, currentUser);
  }

  @Post('account/scheduled-cp/update')
  public async updateScheduledCp(@Body() input: AdminUpdateScheduledCpInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.updateScheduledCpService.execute(input, currentUser);
  }

  @Post('account/delete')
  public async deleteAccount(@Body() input: AdminDeleteAccountInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.deleteAccountService.execute(input, currentUser);
  }

  @Post('account/characters')
  public async listAccountCharacters(
    @Body() input: AdminListAccountCharactersInputDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.listAccountCharactersService.execute(input, currentUser);
  }

  @Post('account/character/update')
  public async updateAccountCharacter(
    @Body() input: AdminUpdateAccountCharacterInputDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.updateAccountCharacterService.execute(input, currentUser);
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

  // --- Item Bundles ---

  @Post('bundles/create')
  public async createBundle(@Body() input: AdminCreateItemBundleInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.createItemBundleService.execute(input, currentUser);
  }

  @Post('bundles/list')
  public async listBundles(@Body() input: AdminListItemBundlesInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.listItemBundlesService.execute(input, currentUser);
  }

  @Post('bundles/update')
  public async updateBundle(@Body() input: AdminUpdateItemBundleInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.updateItemBundleService.execute(input, currentUser);
  }

  @Post('bundles/delete')
  public async deleteBundle(@Body() input: AdminDeleteItemBundleInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.deleteItemBundleService.execute(input, currentUser);
  }

  @Post('bundles/send')
  public async scheduleBundleSend(@Body() input: AdminScheduleItemBundleSendInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.scheduleItemBundleSendService.execute(input, currentUser);
  }

  @Post('bundles/sends')
  public async listBundleSends(@Body() input: AdminListItemBundleSendsInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.listItemBundleSendsService.execute(input, currentUser);
  }

  @Post('bundles/sends/cancel')
  public async cancelBundleSend(@Body() input: AdminCancelItemBundleSendInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.cancelItemBundleSendService.execute(input, currentUser);
  }

  @Get('promos')
  public async getPromos(
    @Query() query: AdminListPromosQueryDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.getPromosService.execute(currentUser, query);
  }

  @Get('promos/insights')
  public async getPromoInsights(
    @Query() query: AdminListPromosQueryDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.getPromoInsightsService.execute(currentUser, query);
  }

  @Post('promo/create')
  public async createPromo(@Body() input: AdminCreatePromoInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.createPromoService.execute(input, currentUser);
  }

  @Post('promo/delete')
  public async deletePromo(@Body() input: AdminDeletePromoInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.deletePromoService.execute(input, currentUser);
  }

  @Post('promo/delete-many')
  public async deleteManyPromos(@Body() input: AdminDeleteManyPromosInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.deleteManyPromosService.execute(input, currentUser);
  }

  @Post('promo/delete-all')
  public async deleteAllPromos(@Body() input: AdminDeleteAllPromosInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.deleteAllPromosService.execute(input, currentUser);
  }
}
