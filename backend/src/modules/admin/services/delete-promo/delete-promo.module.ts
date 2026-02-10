import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { DeletePromoService } from './delete-promo.service';

@Module({
  imports: [ImagineModule],
  providers: [DeletePromoService],
  exports: [DeletePromoService],
})
export class DeletePromoModule {}
