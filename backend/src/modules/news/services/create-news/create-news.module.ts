import { Module } from '@nestjs/common';
import { NewsHelpersModule } from '../news-helpers/news-helpers.module';
import { CreateNewsService } from './create-news.service';

@Module({
  imports: [NewsHelpersModule],
  providers: [CreateNewsService],
  exports: [CreateNewsService],
})
export class CreateNewsModule {}
