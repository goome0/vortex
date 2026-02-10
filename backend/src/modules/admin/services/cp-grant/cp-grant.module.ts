import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { CpGrantService } from './cp-grant.service';

@Module({
  imports: [ImagineModule],
  providers: [CpGrantService],
  exports: [CpGrantService],
})
export class CpGrantModule {}

