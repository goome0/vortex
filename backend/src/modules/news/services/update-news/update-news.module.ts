import { Module } from '@nestjs/common';
import { NewsHelpersModule } from '../news-helpers/news-helpers.module';
import { UpdateNewsService } from './update-news.service';

@Module({
  imports: [NewsHelpersModule],
  providers: [UpdateNewsService],
  exports: [UpdateNewsService],
})
export class UpdateNewsModule {}
