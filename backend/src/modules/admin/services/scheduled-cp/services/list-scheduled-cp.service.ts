import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { EVtxScheduledCpStatus, VtxScheduledCpGrantEntity } from '@/database/entities/vtx-scheduled-cp-grant.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminListScheduledCpInputDTO } from '../../../admin.input';

@Injectable()
export class ListScheduledCpService {
  public constructor(
    @InjectRepository(VtxScheduledCpGrantEntity)
    private readonly repo: Repository<VtxScheduledCpGrantEntity>,
  ) {}

  public async execute(input: AdminListScheduledCpInputDTO, currentUser: CurrentUserDTO) {
    const where: Partial<VtxScheduledCpGrantEntity> = {};
    if (input.username) where.username = input.username.trim().toLowerCase();
    if (input.status) where.status = input.status as EVtxScheduledCpStatus;

    const data = await this.repo.find({
      where,
      order: { scheduledAt: 'DESC' },
      take: 200,
    });

    return SuccessResponse.toJson({
      code: 'SCHEDULED_CP_LIST_SUCCESS',
      message: 'Scheduled CP grants retrieved successfully',
      path: '/admin/account/scheduled-cp',
      data,
      successCode: HttpStatus.OK,
    });
  }
}

