import { ImagineModule } from '@/common/imagine/imagine.module';
import { CompHackEntities } from '@/database/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePromoService } from './create-promo.service';

@Module({
  imports: [ImagineModule, TypeOrmModule.forFeature([CompHackEntities.Promo])],
  providers: [CreatePromoService],
  exports: [CreatePromoService],
})
export class CreatePromoModule {}
