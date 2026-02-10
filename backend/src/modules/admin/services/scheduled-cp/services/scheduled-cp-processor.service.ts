import { CpGrantService } from '@/modules/admin/services/cp-grant/cp-grant.service';
import { EVtxScheduledCpStatus, VtxScheduledCpGrantEntity } from '@/database/entities/vtx-scheduled-cp-grant.entity';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class ScheduledCpProcessorService {
  private readonly logger = new Logger(ScheduledCpProcessorService.name);

  public constructor(
    @InjectRepository(VtxScheduledCpGrantEntity)
    private readonly repo: Repository<VtxScheduledCpGrantEntity>,
    private readonly cpGrantService: CpGrantService,
  ) {}

  // Every 30 seconds
  @Cron('*/30 * * * * *')
  public async tick() {
    const now = new Date();

    const due = await this.repo.find({
      where: {
        status: EVtxScheduledCpStatus.PENDING,
        scheduledAt: LessThanOrEqual(now),
      },
      order: { scheduledAt: 'ASC' },
      take: 25,
    });

    if (due.length === 0) return;

    for (const item of due) {
      // Mark as processing (best-effort concurrency guard)
      const updated = await this.repo.update(
        { id: item.id, status: EVtxScheduledCpStatus.PENDING },
        { status: EVtxScheduledCpStatus.PROCESSING, attempts: item.attempts + 1 },
      );
      if (!updated.affected) continue;

      try {
        const { previousCp, newCp } = await this.cpGrantService.addCp({
          username: item.username,
          amount: item.amount,
          requestedByUsername: item.createdByUsername,
        });

        await this.repo.update(
          { id: item.id },
          {
            status: EVtxScheduledCpStatus.COMPLETED,
            processedAt: new Date(),
            previousCp,
            newCp,
            lastError: null,
          },
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        this.logger.error(`Failed scheduled CP grant ${item.id} for ${item.username}: ${msg}`);
        await this.repo.update(
          { id: item.id },
          {
            status: EVtxScheduledCpStatus.FAILED,
            processedAt: new Date(),
            lastError: msg,
          },
        );
      }
    }
  }
}

