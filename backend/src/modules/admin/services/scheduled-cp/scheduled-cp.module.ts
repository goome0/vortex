import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompHackEntities } from '@/database/entities';
import { VtxScheduledCpGrantEntity } from '@/database/entities/vtx-scheduled-cp-grant.entity';
import { ScheduleCpService } from './services/schedule-cp.service';
import { ListScheduledCpService } from './services/list-scheduled-cp.service';
import { CancelScheduledCpService } from './services/cancel-scheduled-cp.service';
import { ScheduledCpProcessorService } from './services/scheduled-cp-processor.service';
import { UpdateScheduledCpService } from './services/update-scheduled-cp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VtxScheduledCpGrantEntity, CompHackEntities.Account]),
  ],
  providers: [
    ScheduleCpService,
    ListScheduledCpService,
    CancelScheduledCpService,
    UpdateScheduledCpService,
    ScheduledCpProcessorService,
  ],
  exports: [ScheduleCpService, ListScheduledCpService, CancelScheduledCpService, UpdateScheduledCpService],
})
export class ScheduledCpModule {}

