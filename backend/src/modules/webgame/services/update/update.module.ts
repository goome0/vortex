import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { UpdateService } from './update.service';

@Module({
  imports: [ImagineModule],
  providers: [UpdateService],
  exports: [UpdateService],
})
export class UpdateModule {}
