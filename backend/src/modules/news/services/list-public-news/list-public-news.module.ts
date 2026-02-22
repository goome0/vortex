import { Module } from '@nestjs/common';
import { NewsHelpersModule } from '../news-helpers/news-helpers.module';
import { ListPublicNewsService } from './list-public-news.service';

@Module({
  imports: [NewsHelpersModule],
  providers: [ListPublicNewsService],
  exports: [ListPublicNewsService],
})
export class ListPublicNewsModule {}
