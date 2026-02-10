import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { MessageWorldService } from './message-world.service';

@Module({
  imports: [ImagineModule],
  providers: [MessageWorldService],
  exports: [MessageWorldService],
})
export class MessageWorldModule {}
