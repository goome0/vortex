import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { VtxItemBundleEntity } from '@/database/entities/vtx-item-bundle.entity';
import { EVtxItemBundleRecipientStatus, VtxItemBundleSendRecipientEntity } from '@/database/entities/vtx-item-bundle-send-recipient.entity';
import { VtxItemBundleSendBatchEntity } from '@/database/entities/vtx-item-bundle-send-batch.entity';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminScheduleItemBundleSendInputDTO } from '../../../admin.input';

@Injectable()
export class ScheduleItemBundleSendService {
  private readonly logger = new Logger(ScheduleItemBundleSendService.name);

  public constructor(
    @InjectRepository(VtxItemBundleEntity)
    private readonly bundleRepo: Repository<VtxItemBundleEntity>,
    @InjectRepository(VtxItemBundleSendBatchEntity)
    private readonly batchRepo: Repository<VtxItemBundleSendBatchEntity>,
    @InjectRepository(VtxItemBundleSendRecipientEntity)
    private readonly recipientRepo: Repository<VtxItemBundleSendRecipientEntity>,
  ) {}

  public async execute(input: AdminScheduleItemBundleSendInputDTO, currentUser: CurrentUserDTO) {
    const bundle = await this.bundleRepo.findOne({ where: { id: input.bundleId } });
    if (!bundle) {
      throw ErrorResponse.toHttpException({
        message: 'Bundle not found',
        statusCode: HttpStatus.NOT_FOUND,
        code: 'BUNDLE_NOT_FOUND',
      });
    }

    const scheduledAt = new Date(input.scheduledAtMs ?? Date.now());
    const usernames = Array.from(
      new Set(
        input.usernames
          .map((u) => u?.toString().trim().toLowerCase())
          .filter((u) => typeof u === 'string' && u.length > 0),
      ),
    );

    if (usernames.length === 0) {
      throw ErrorResponse.toHttpException({
        message: 'No valid usernames provided',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'INVALID_USERNAMES',
      });
    }

    this.logger.log(`Scheduling bundle send ${bundle.name} to ${usernames.length} users at ${scheduledAt.toISOString()}`);

    const batch = this.batchRepo.create({
      bundleId: bundle.id,
      bundleName: bundle.name,
      cpCost: bundle.cpCost,
      products: bundle.products,
      reason: input.reason?.trim() || null,
      createdByUsername: currentUser.username.trim().toLowerCase(),
      scheduledAt,
      completedAt: null,
      totalRecipients: usernames.length,
      processedCount: 0,
      successCount: 0,
      failureCount: 0,
      lastError: null,
    });
    const savedBatch = await this.batchRepo.save(batch);

    const recipients = usernames.map((username) =>
      this.recipientRepo.create({
        batchId: savedBatch.id,
        username,
        status: EVtxItemBundleRecipientStatus.PENDING,
        attempts: 0,
        lastError: null,
        sentAt: null,
      }),
    );
    await this.recipientRepo.save(recipients);

    return SuccessResponse.toJson({
      code: 'BUNDLE_SEND_SCHEDULED',
      message: 'Bundle send scheduled successfully',
      path: '/admin/bundles/send',
      data: { batchId: savedBatch.id, totalRecipients: usernames.length, scheduledAt },
      successCode: HttpStatus.CREATED,
    });
  }
}

