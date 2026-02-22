import { Module } from '@nestjs/common';
import { NewsHelpersModule } from '../news-helpers/news-helpers.module';
import { DeleteNewsService } from './delete-news.service';

@Module({
  imports: [NewsHelpersModule],
  providers: [DeleteNewsService],
  exports: [DeleteNewsService],
})
export class DeleteNewsModule {}
