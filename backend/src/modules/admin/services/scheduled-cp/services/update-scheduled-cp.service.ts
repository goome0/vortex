import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { EVtxScheduledCpStatus, VtxScheduledCpGrantEntity } from '@/database/entities/vtx-scheduled-cp-grant.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUpdateScheduledCpInputDTO } from '../../../admin.input';

@Injectable()
export class UpdateScheduledCpService {
  public constructor(
    @InjectRepository(VtxScheduledCpGrantEntity)
    private readonly repo: Repository<VtxScheduledCpGrantEntity>,
  ) {}

  public async execute(input: AdminUpdateScheduledCpInputDTO, currentUser: CurrentUserDTO) {
    const entity = await this.repo.findOne({ where: { id: input.id } });
    if (!entity) {
      throw ErrorResponse.toHttpException({
        message: 'Scheduled CP grant not found',
        statusCode: HttpStatus.NOT_FOUND,
        code: 'SCHEDULED_CP_NOT_FOUND',
      });
    }

    if (entity.status !== EVtxScheduledCpStatus.PENDING) {
      throw ErrorResponse.toHttpException({
        message: 'Only pending scheduled CP grants can be updated',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'SCHEDULED_CP_NOT_UPDATABLE',
      });
    }

    const hasAny =
      typeof input.amount === 'number' ||
      typeof input.scheduledAtMs === 'number' ||
      typeof input.reason === 'string';

    if (!hasAny) {
      throw ErrorResponse.toHttpException({
        message: 'Nothing to update',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'SCHEDULED_CP_NO_CHANGES',
      });
    }

    const patch: Partial<VtxScheduledCpGrantEntity> = {};
    if (typeof input.amount === 'number') patch.amount = input.amount;
    if (typeof input.scheduledAtMs === 'number') patch.scheduledAt = new Date(input.scheduledAtMs);
    if (typeof input.reason === 'string') patch.reason = input.reason.trim() || null;

    await this.repo.update({ id: entity.id }, patch);

    const updated = await this.repo.findOne({ where: { id: entity.id } });

    return SuccessResponse.toJson({
      code: 'SCHEDULED_CP_UPDATED',
      message: 'Scheduled CP grant updated',
      path: '/admin/account/scheduled-cp/update',
      data: updated ?? entity,
      successCode: HttpStatus.OK,
    });
  }
}

