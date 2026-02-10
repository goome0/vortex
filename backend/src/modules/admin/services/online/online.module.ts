import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { OnlineService } from './online.service';

@Module({
  imports: [ImagineModule],
  providers: [OnlineService],
  exports: [OnlineService],
})
export class OnlineModule {}
