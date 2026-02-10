import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VtxScheduledCpGrantEntity } from '@/database/entities/vtx-scheduled-cp-grant.entity';
import { CpGrantModule } from '../cp-grant/cp-grant.module';
import { ScheduleCpService } from './services/schedule-cp.service';
import { ListScheduledCpService } from './services/list-scheduled-cp.service';
import { CancelScheduledCpService } from './services/cancel-scheduled-cp.service';
import { ScheduledCpProcessorService } from './services/scheduled-cp-processor.service';

@Module({
  imports: [TypeOrmModule.forFeature([VtxScheduledCpGrantEntity]), CpGrantModule],
  providers: [ScheduleCpService, ListScheduledCpService, CancelScheduledCpService, ScheduledCpProcessorService],
  exports: [ScheduleCpService, ListScheduledCpService, CancelScheduledCpService],
})
export class ScheduledCpModule {}

