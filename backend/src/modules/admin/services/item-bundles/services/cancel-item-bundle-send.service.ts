import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { EVtxItemBundleSendStatus, VtxItemBundleSendBatchEntity } from '@/database/entities/vtx-item-bundle-send-batch.entity';
import { EVtxItemBundleRecipientStatus, VtxItemBundleSendRecipientEntity } from '@/database/entities/vtx-item-bundle-send-recipient.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminCancelItemBundleSendInputDTO } from '../../../admin.input';

@Injectable()
export class CancelItemBundleSendService {
  public constructor(
    @InjectRepository(VtxItemBundleSendBatchEntity)
    private readonly batchRepo: Repository<VtxItemBundleSendBatchEntity>,
    @InjectRepository(VtxItemBundleSendRecipientEntity)
    private readonly recipientRepo: Repository<VtxItemBundleSendRecipientEntity>,
  ) {}

  public async execute(input: AdminCancelItemBundleSendInputDTO, currentUser: CurrentUserDTO) {
    const batch = await this.batchRepo.findOne({ where: { id: input.id } });
    if (!batch) {
      throw ErrorResponse.toHttpException({
        message: 'Send batch not found',
        statusCode: HttpStatus.NOT_FOUND,
        code: 'BUNDLE_SEND_NOT_FOUND',
      });
    }

    if (batch.status !== EVtxItemBundleSendStatus.PENDING) {
      throw ErrorResponse.toHttpException({
        message: 'Only pending sends can be cancelled',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'BUNDLE_SEND_NOT_CANCELLABLE',
      });
    }

    await this.batchRepo.update({ id: batch.id }, { status: EVtxItemBundleSendStatus.CANCELLED, completedAt: new Date() });
    await this.recipientRepo.update(
      { batchId: batch.id, status: EVtxItemBundleRecipientStatus.PENDING },
      { status: EVtxItemBundleRecipientStatus.CANCELLED },
    );

    return SuccessResponse.toJson({
      code: 'BUNDLE_SEND_CANCELLED',
      message: 'Bundle send cancelled',
      path: '/admin/bundles/sends/cancel',
      successCode: HttpStatus.OK,
    });
  }
}

