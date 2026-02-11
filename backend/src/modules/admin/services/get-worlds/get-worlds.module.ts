import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { GetWorldsService } from './get-worlds.service';

@Module({
  imports: [ImagineModule],
  providers: [GetWorldsService],
  exports: [GetWorldsService],
})
export class GetWorldsModule {}

