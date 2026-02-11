import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { GetAccountsModule } from './services/get-accounts/get-accounts.module';
import { GetAccountModule } from './services/get-account/get-account.module';
import { UpdateAccountModule } from './services/update-account/update-account.module';
import { DeleteAccountModule } from './services/delete-account/delete-account.module';
import { KickPlayerModule } from './services/kick-player/kick-player.module';
import { MessageWorldModule } from './services/message-world/message-world.module';
import { OnlineModule } from './services/online/online.module';
import { PostItemsModule } from './services/post-items/post-items.module';
import { GetPromosModule } from './services/get-promos/get-promos.module';
import { CreatePromoModule } from './services/create-promo/create-promo.module';
import { DeletePromoModule } from './services/delete-promo/delete-promo.module';
import { AddCpModule } from './services/add-cp/add-cp.module';
import { ScheduledCpModule } from './services/scheduled-cp/scheduled-cp.module';
import { ItemBundlesModule } from './services/item-bundles/item-bundles.module';
import { GetWorldsModule } from './services/get-worlds/get-worlds.module';

@Module({
  imports: [
    GetAccountsModule,
    GetAccountModule,
    UpdateAccountModule,
    AddCpModule,
    ScheduledCpModule,
    ItemBundlesModule,
    DeleteAccountModule,
    KickPlayerModule,
    MessageWorldModule,
    GetWorldsModule,
    OnlineModule,
    PostItemsModule,
    GetPromosModule,
    CreatePromoModule,
    DeletePromoModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
