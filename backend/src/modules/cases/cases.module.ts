import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VtxSupportCaseEntity } from '@/database/entities/vtx-support-case.entity';
import { VtxSupportCaseMessageEntity } from '@/database/entities/vtx-support-case-message.entity';
import { CasesController } from './cases.controller';
import { AdminCasesController } from './admin-cases.controller';
import { CasesService } from './cases.service';

@Module({
  imports: [TypeOrmModule.forFeature([VtxSupportCaseEntity, VtxSupportCaseMessageEntity])],
  controllers: [CasesController, AdminCasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}
