import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { GetCoinsService } from './get-coins.service';

@Module({
  imports: [ImagineModule],
  providers: [GetCoinsService],
  exports: [GetCoinsService],
})
export class GetCoinsModule {}
