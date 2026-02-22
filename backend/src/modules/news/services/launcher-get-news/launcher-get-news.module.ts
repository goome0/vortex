import { Module } from '@nestjs/common';
import { NewsHelpersModule } from '../news-helpers/news-helpers.module';
import { LauncherGetNewsService } from './launcher-get-news.service';

@Module({
  imports: [NewsHelpersModule],
  providers: [LauncherGetNewsService],
  exports: [LauncherGetNewsService],
})
export class LauncherGetNewsModule {}
