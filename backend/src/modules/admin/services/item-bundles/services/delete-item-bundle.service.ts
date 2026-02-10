import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { VtxItemBundleEntity } from '@/database/entities/vtx-item-bundle.entity';
import { EVtxItemBundleSendStatus, VtxItemBundleSendBatchEntity } from '@/database/entities/vtx-item-bundle-send-batch.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminDeleteItemBundleInputDTO } from '../../../admin.input';

@Injectable()
export class DeleteItemBundleService {
  public constructor(
    @InjectRepository(VtxItemBundleEntity)
    private readonly bundleRepo: Repository<VtxItemBundleEntity>,
    @InjectRepository(VtxItemBundleSendBatchEntity)
    private readonly batchRepo: Repository<VtxItemBundleSendBatchEntity>,
  ) {}

  public async execute(input: AdminDeleteItemBundleInputDTO, currentUser: CurrentUserDTO) {
    const entity = await this.bundleRepo.findOne({ where: { id: input.id } });
    if (!entity) {
      throw ErrorResponse.toHttpException({
        message: 'Bundle not found',
        statusCode: HttpStatus.NOT_FOUND,
        code: 'BUNDLE_NOT_FOUND',
      });
    }

    // Prevent deleting bundles with pending/processing scheduled sends.
    const active = await this.batchRepo.count({
      where: [
        { bundleId: entity.id, status: EVtxItemBundleSendStatus.PENDING },
        { bundleId: entity.id, status: EVtxItemBundleSendStatus.PROCESSING },
      ],
    });
    if (active > 0) {
      throw ErrorResponse.toHttpException({
        message: 'Bundle has scheduled sends. Delete batches first.',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'BUNDLE_HAS_SENDS',
      });
    }

    await this.bundleRepo.delete({ id: entity.id });

    return SuccessResponse.toJson({
      code: 'BUNDLE_DELETED',
      message: 'Bundle deleted successfully',
      path: '/admin/bundles/delete',
      successCode: HttpStatus.OK,
    });
  }
}

