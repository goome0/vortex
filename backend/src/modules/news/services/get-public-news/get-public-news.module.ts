import { Module } from '@nestjs/common';
import { NewsHelpersModule } from '../news-helpers/news-helpers.module';
import { GetPublicNewsService } from './get-public-news.service';

@Module({
  imports: [NewsHelpersModule],
  providers: [GetPublicNewsService],
  exports: [GetPublicNewsService],
})
export class GetPublicNewsModule {}
