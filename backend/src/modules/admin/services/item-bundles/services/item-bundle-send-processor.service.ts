import { EVtxItemBundleSendStatus, VtxItemBundleSendBatchEntity } from '@/database/entities/vtx-item-bundle-send-batch.entity';
import { EVtxItemBundleRecipientStatus, VtxItemBundleSendRecipientEntity } from '@/database/entities/vtx-item-bundle-send-recipient.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { ItemBundleDispatchService } from './item-bundle-dispatch.service';

@Injectable()
export class ItemBundleSendProcessorService {
  private readonly logger = new Logger(ItemBundleSendProcessorService.name);

  public constructor(
    @InjectRepository(VtxItemBundleSendBatchEntity)
    private readonly batchRepo: Repository<VtxItemBundleSendBatchEntity>,
    @InjectRepository(VtxItemBundleSendRecipientEntity)
    private readonly recipientRepo: Repository<VtxItemBundleSendRecipientEntity>,
    private readonly dispatchService: ItemBundleDispatchService,
  ) {}

  // Every 30 seconds
  @Cron('*/30 * * * * *')
  public async tick() {
    const now = new Date();

    const dueBatches = await this.batchRepo.find({
      where: { status: EVtxItemBundleSendStatus.PENDING, scheduledAt: LessThanOrEqual(now) },
      order: { scheduledAt: 'ASC' },
      take: 10,
    });

    for (const batch of dueBatches) {
      // Mark batch processing (simple concurrency guard)
      const locked = await this.batchRepo.update(
        { id: batch.id, status: EVtxItemBundleSendStatus.PENDING },
        { status: EVtxItemBundleSendStatus.PROCESSING },
      );
      if (!locked.affected) continue;

      // Process up to 25 recipients per tick per batch
      const recipients = await this.recipientRepo.find({
        where: { batchId: batch.id, status: EVtxItemBundleRecipientStatus.PENDING },
        order: { createdAt: 'ASC' },
        take: 25,
      });

      for (const r of recipients) {
        try {
          await this.dispatchService.dispatch({
            requestedByUsername: batch.createdByUsername,
            targetUsername: r.username,
            cpCost: batch.cpCost,
            products: batch.products,
          });

          await this.recipientRepo.update(
            { id: r.id },
            {
              status: EVtxItemBundleRecipientStatus.SENT,
              sentAt: new Date(),
              attempts: r.attempts + 1,
              lastError: null,
            },
          );
          await this.batchRepo.increment({ id: batch.id }, 'processedCount', 1);
          await this.batchRepo.increment({ id: batch.id }, 'successCount', 1);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Unknown error';
          this.logger.error(`Failed bundle recipient ${r.username} in batch ${batch.id}: ${msg}`);
          await this.recipientRepo.update(
            { id: r.id },
            {
              status: EVtxItemBundleRecipientStatus.FAILED,
              sentAt: new Date(),
              attempts: r.attempts + 1,
              lastError: msg,
            },
          );
          await this.batchRepo.increment({ id: batch.id }, 'processedCount', 1);
          await this.batchRepo.increment({ id: batch.id }, 'failureCount', 1);
          await this.batchRepo.update({ id: batch.id }, { lastError: msg });
        }
      }

      // If no more pending recipients, complete batch; otherwise release back to pending for next tick.
      const pendingLeft = await this.recipientRepo.count({
        where: { batchId: batch.id, status: EVtxItemBundleRecipientStatus.PENDING },
      });

      if (pendingLeft === 0) {
        await this.batchRepo.update(
          { id: batch.id },
          { status: EVtxItemBundleSendStatus.COMPLETED, completedAt: new Date() },
        );
      } else {
        await this.batchRepo.update({ id: batch.id }, { status: EVtxItemBundleSendStatus.PENDING });
      }
    }
  }
}

