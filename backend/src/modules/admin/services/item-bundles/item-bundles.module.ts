import { ImagineModule } from '@/common/imagine/imagine.module';
import { VtxItemBundleEntity } from '@/database/entities/vtx-item-bundle.entity';
import { VtxItemBundleSendBatchEntity } from '@/database/entities/vtx-item-bundle-send-batch.entity';
import { VtxItemBundleSendRecipientEntity } from '@/database/entities/vtx-item-bundle-send-recipient.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemBundleDispatchService } from './services/item-bundle-dispatch.service';
import { CreateItemBundleService } from './services/create-item-bundle.service';
import { ListItemBundlesService } from './services/list-item-bundles.service';
import { UpdateItemBundleService } from './services/update-item-bundle.service';
import { DeleteItemBundleService } from './services/delete-item-bundle.service';
import { ScheduleItemBundleSendService } from './services/schedule-item-bundle-send.service';
import { ListItemBundleSendsService } from './services/list-item-bundle-sends.service';
import { CancelItemBundleSendService } from './services/cancel-item-bundle-send.service';
import { ItemBundleSendProcessorService } from './services/item-bundle-send-processor.service';

@Module({
  imports: [
    ImagineModule,
    TypeOrmModule.forFeature([
      VtxItemBundleEntity,
      VtxItemBundleSendBatchEntity,
      VtxItemBundleSendRecipientEntity,
    ]),
  ],
  providers: [
    ItemBundleDispatchService,
    CreateItemBundleService,
    ListItemBundlesService,
    UpdateItemBundleService,
    DeleteItemBundleService,
    ScheduleItemBundleSendService,
    ListItemBundleSendsService,
    CancelItemBundleSendService,
    ItemBundleSendProcessorService,
  ],
  exports: [
    CreateItemBundleService,
    ListItemBundlesService,
    UpdateItemBundleService,
    DeleteItemBundleService,
    ScheduleItemBundleSendService,
    ListItemBundleSendsService,
    CancelItemBundleSendService,
  ],
})
export class ItemBundlesModule {}

