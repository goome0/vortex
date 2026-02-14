import { CompHackEntities } from '@/database/entities';
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
    private readonly grantRepo: Repository<VtxScheduledCpGrantEntity>,
    @InjectRepository(CompHackEntities.Account)
    private readonly accountRepo: Repository<CompHackEntities.Account>,
  ) {}

  // Every 30 seconds
  @Cron('*/30 * * * * *')
  public async tick() {
    const now = new Date();

    const due = await this.grantRepo.find({
      where: {
        status: EVtxScheduledCpStatus.PENDING,
        scheduledAt: LessThanOrEqual(now),
      },
      order: { scheduledAt: 'ASC' },
      take: 25,
    });

    if (due.length === 0) return;

    for (const item of due) {
      const updated = await this.grantRepo.update(
        { id: item.id, status: EVtxScheduledCpStatus.PENDING },
        { status: EVtxScheduledCpStatus.PROCESSING, attempts: item.attempts + 1 },
      );
      if (!updated.affected) continue;

      try {
        const { previousCp, newCp } = await this.accountRepo.manager.transaction(
          async (tx) => {
            const account = await tx
              .createQueryBuilder(CompHackEntities.Account, 'a')
              .setLock('pessimistic_write')
              .where('LOWER(TRIM(a.username)) = :username', {
                username: item.username.trim().toLowerCase(),
              })
              .getOne();

            if (!account) {
              throw new Error(`Account not found: ${item.username}`);
            }

            const previousCp = Math.max(0, parseInt(String(account.cp ?? 0), 10) || 0);
            const newCp = previousCp + item.amount;

            await tx.update(
              CompHackEntities.Account,
              { uid: account.uid },
              { cp: String(newCp) },
            );

            return { previousCp, newCp };
          },
        );

        await this.grantRepo.update(
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
        await this.grantRepo.update(
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

