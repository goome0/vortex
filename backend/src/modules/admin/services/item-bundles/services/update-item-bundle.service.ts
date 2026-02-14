import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { VtxItemBundleEntity } from '@/database/entities/vtx-item-bundle.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUpdateItemBundleInputDTO } from '../../../admin.input';

@Injectable()
export class UpdateItemBundleService {
  public constructor(
    @InjectRepository(VtxItemBundleEntity)
    private readonly repo: Repository<VtxItemBundleEntity>,
  ) {}

  public async execute(input: AdminUpdateItemBundleInputDTO, currentUser: CurrentUserDTO) {
    const entity = await this.repo.findOne({ where: { id: input.id } });
    if (!entity) {
      throw ErrorResponse.toHttpException({
        message: 'Bundle not found',
        statusCode: HttpStatus.NOT_FOUND,
        code: 'BUNDLE_NOT_FOUND',
      });
    }

    if (input.name && input.name.trim() !== entity.name) {
      const name = input.name.trim();
      const exists = await this.repo.findOne({ where: { name } });
      if (exists) {
        throw ErrorResponse.toHttpException({
          message: 'Bundle name already exists',
          statusCode: HttpStatus.BAD_REQUEST,
          code: 'BUNDLE_NAME_EXISTS',
        });
      }
      entity.name = name;
    }

    if (typeof input.description === 'string') {
      entity.description = input.description.trim() || null;
    }
    if (typeof input.cpCost === 'number') {
      entity.cpCost = input.cpCost;
    }
    if (Array.isArray(input.products)) {
      entity.products = input.products;
    }

    const saved = await this.repo.save(entity);

    return SuccessResponse.toJson({
      code: 'BUNDLE_UPDATED',
      message: 'Bundle updated successfully',
      path: '/admin/bundles/update',
      data: saved,
      successCode: HttpStatus.OK,
    });
  }
}

