import { IsPublicRoute } from '@/common/decorators';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { PublicListNewsQueryDTO } from './news.input';

@Controller('news')
export class NewsController {
  public constructor(private readonly newsService: NewsService) {}

  @Get()
  @IsPublicRoute()
  public async list(@Query() query: PublicListNewsQueryDTO) {
    return this.newsService.publicList(query);
  }

  @Get(':idOrSlug')
  @IsPublicRoute()
  public async get(@Param('idOrSlug') idOrSlug: string) {
    return this.newsService.publicGet(idOrSlug);
  }
}

