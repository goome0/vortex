import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { EVtxScheduledCpStatus, VtxScheduledCpGrantEntity } from '@/database/entities/vtx-scheduled-cp-grant.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminCancelScheduledCpInputDTO } from '../../../admin.input';

@Injectable()
export class CancelScheduledCpService {
  public constructor(
    @InjectRepository(VtxScheduledCpGrantEntity)
    private readonly repo: Repository<VtxScheduledCpGrantEntity>,
  ) {}

  public async execute(input: AdminCancelScheduledCpInputDTO, currentUser: CurrentUserDTO) {
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
        message: 'Only pending scheduled CP grants can be cancelled',
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'SCHEDULED_CP_NOT_CANCELLABLE',
      });
    }

    await this.repo.update({ id: entity.id }, { status: EVtxScheduledCpStatus.CANCELLED });

    return SuccessResponse.toJson({
      code: 'SCHEDULED_CP_CANCELLED',
      message: 'Scheduled CP grant cancelled',
      path: '/admin/account/scheduled-cp/cancel',
      successCode: HttpStatus.OK,
    });
  }
}

