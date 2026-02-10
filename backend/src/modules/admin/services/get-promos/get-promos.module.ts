import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { GetPromosService } from './get-promos.service';

@Module({
  imports: [ImagineModule],
  providers: [GetPromosService],
  exports: [GetPromosService],
})
export class GetPromosModule {}
