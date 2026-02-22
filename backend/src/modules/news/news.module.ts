import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VtxNewsEntity } from '@/database/entities/vtx-news.entity';
import { AdminNewsController } from './admin-news.controller';
import { LauncherController } from './launcher.controller';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { NewsSeedService } from './news.seed';

@Module({
  imports: [TypeOrmModule.forFeature([VtxNewsEntity])],
  controllers: [NewsController, AdminNewsController, LauncherController],
  providers: [NewsService, NewsSeedService],
  exports: [NewsService],
})
export class NewsModule {}
