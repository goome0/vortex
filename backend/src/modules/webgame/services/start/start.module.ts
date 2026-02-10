import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { StartService } from './start.service';

@Module({
  imports: [ImagineModule],
  providers: [StartService],
  exports: [StartService],
})
export class StartModule {}
