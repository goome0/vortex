import { Module } from '@nestjs/common';
import { NewsHelpersModule } from '../news-helpers/news-helpers.module';
import { LauncherListNewsService } from './launcher-list-news.service';

@Module({
  imports: [NewsHelpersModule],
  providers: [LauncherListNewsService],
  exports: [LauncherListNewsService],
})
export class LauncherListNewsModule {}
