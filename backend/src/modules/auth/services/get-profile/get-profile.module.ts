import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { GetProfileService } from './get-profile.service';

@Module({
  imports: [ImagineModule],
  providers: [GetProfileService],
  exports: [GetProfileService],
})
export class GetProfileModule {}
