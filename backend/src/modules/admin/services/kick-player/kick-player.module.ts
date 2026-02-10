import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { KickPlayerService } from './kick-player.service';

@Module({
  imports: [ImagineModule],
  providers: [KickPlayerService],
  exports: [KickPlayerService],
})
export class KickPlayerModule {}
