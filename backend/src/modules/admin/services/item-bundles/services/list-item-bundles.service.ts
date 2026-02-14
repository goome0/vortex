import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { VtxItemBundleEntity } from '@/database/entities/vtx-item-bundle.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AdminListItemBundlesInputDTO } from '../../../admin.input';

@Injectable()
export class ListItemBundlesService {
  public constructor(
    @InjectRepository(VtxItemBundleEntity)
    private readonly repo: Repository<VtxItemBundleEntity>,
  ) {}

  public async execute(input: AdminListItemBundlesInputDTO, currentUser: CurrentUserDTO) {
    const q = input.q?.trim();
    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const skip = (page - 1) * limit;

    const [items, total] = await this.repo.findAndCount({
      where: q ? { name: Like(`%${q}%`) } : {},
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    return SuccessResponse.toJson({
      code: 'BUNDLES_LIST_SUCCESS',
      message: 'Bundles retrieved successfully',
      path: '/admin/bundles/list',
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
