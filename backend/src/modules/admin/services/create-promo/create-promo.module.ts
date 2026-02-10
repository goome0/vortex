import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { CreatePromoService } from './create-promo.service';

@Module({
  imports: [ImagineModule],
  providers: [CreatePromoService],
  exports: [CreatePromoService],
})
export class CreatePromoModule {}
