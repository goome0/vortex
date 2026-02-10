import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { VtxScheduledCpGrantEntity } from '@/database/entities/vtx-scheduled-cp-grant.entity';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminScheduleCpInputDTO } from '../../../admin.input';

@Injectable()
export class ScheduleCpService {
  private readonly logger = new Logger(ScheduleCpService.name);

  public constructor(
    @InjectRepository(VtxScheduledCpGrantEntity)
    private readonly repo: Repository<VtxScheduledCpGrantEntity>,
  ) {}

  public async execute(input: AdminScheduleCpInputDTO, currentUser: CurrentUserDTO) {
    const username = input.username.trim().toLowerCase();
    const scheduledAt = new Date(input.scheduledAtMs);

    this.logger.log(
      `Scheduling CP grant for ${username} (+${input.amount}) at ${scheduledAt.toISOString()} - requested by ${currentUser.username}`,
    );

    const entity = this.repo.create({
      username,
      amount: input.amount,
      reason: input.reason?.trim() || null,
      createdByUsername: currentUser.username.trim().toLowerCase(),
      scheduledAt,
      processedAt: null,
      previousCp: null,
      newCp: null,
      attempts: 0,
      lastError: null,
    });

    const saved = await this.repo.save(entity);

    return SuccessResponse.toJson({
      code: 'SCHEDULE_CP_SUCCESS',
      message: 'CP scheduled successfully',
      path: '/admin/account/schedule-cp',
      data: saved,
      successCode: HttpStatus.CREATED,
    });
  }
}

