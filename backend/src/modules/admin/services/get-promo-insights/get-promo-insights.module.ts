import { ImagineModule } from '@/common/imagine/imagine.module';
import { CompHackEntities } from '@/database/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetPromoInsightsService } from './get-promo-insights.service';

@Module({
  imports: [
    ImagineModule,
    TypeOrmModule.forFeature([CompHackEntities.Promo, CompHackEntities.PromoExchange]),
  ],
  providers: [GetPromoInsightsService],
  exports: [GetPromoInsightsService],
})
export class GetPromoInsightsModule {}
