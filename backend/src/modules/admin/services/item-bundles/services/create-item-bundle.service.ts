import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { VtxItemBundleEntity } from '@/database/entities/vtx-item-bundle.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminCreateItemBundleInputDTO } from '../../../admin.input';
import { normalizeProducts } from '../../../utils/product-quantity.util';

@Injectable()
export class CreateItemBundleService {
  public constructor(
    @InjectRepository(VtxItemBundleEntity)
    private readonly repo: Repository<VtxItemBundleEntity>,
  ) {}

  public async execute(input: AdminCreateItemBundleInputDTO, currentUser: CurrentUserDTO) {
    const name = input.name.trim();
    const exists = await this.repo.findOne({ where: { name } });
    if (exists) {
      throw ErrorResponse.toHttpException({
        message: 'Bundle name already exists',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'BUNDLE_NAME_EXISTS',
      });
    }

    const products = normalizeProducts(input.products);
    if (products.length === 0) {
      throw ErrorResponse.toHttpException({
        message: 'At least one valid product is required',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'INVALID_PRODUCTS',
      });
    }

    const entity = this.repo.create({
      name,
      description: input.description?.trim() || null,
      cpCost: input.cpCost ?? 0,
      products,
      createdByUsername: currentUser.username.trim().toLowerCase(),
    });

    const saved = await this.repo.save(entity);

    return SuccessResponse.toJson({
      code: 'BUNDLE_CREATED',
      message: 'Bundle created successfully',
      path: '/admin/bundles/create',
      data: saved,
      successCode: HttpStatus.CREATED,
    });
  }
}

