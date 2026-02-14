import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { VtxItemBundleSendBatchEntity } from '@/database/entities/vtx-item-bundle-send-batch.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AdminListItemBundleSendsInputDTO } from '../../../admin.input';

@Injectable()
export class ListItemBundleSendsService {
  public constructor(
    @InjectRepository(VtxItemBundleSendBatchEntity)
    private readonly repo: Repository<VtxItemBundleSendBatchEntity>,
  ) {}

  public async execute(input: AdminListItemBundleSendsInputDTO, currentUser: CurrentUserDTO) {
    const where: FindOptionsWhere<VtxItemBundleSendBatchEntity> | undefined = input.bundleId
      ? { bundleId: input.bundleId }
      : undefined;

    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const skip = (page - 1) * limit;

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { scheduledAt: 'DESC' },
      take: limit,
      skip,
    });

    return SuccessResponse.toJson({
      code: 'BUNDLE_SENDS_LIST_SUCCESS',
      message: 'Bundle sends retrieved successfully',
      path: '/admin/bundles/sends',
      data: {
        items,
        total,
        page,
        limit,
      },
      successCode: HttpStatus.OK,
    });
  }
}
