import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VtxNewsEntity } from '@/database/entities/vtx-news.entity';
import { NewsHelpersService } from './news-helpers.service';

@Module({
  imports: [TypeOrmModule.forFeature([VtxNewsEntity])],
  providers: [NewsHelpersService],
  exports: [NewsHelpersService],
})
export class NewsHelpersModule {}
