import { Module } from '@nestjs/common';
import { NewsHelpersModule } from '../news-helpers/news-helpers.module';
import { ListAdminNewsService } from './list-admin-news.service';

@Module({
  imports: [NewsHelpersModule],
  providers: [ListAdminNewsService],
  exports: [ListAdminNewsService],
})
export class ListAdminNewsModule {}
