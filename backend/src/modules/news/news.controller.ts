import { IsPublicRoute } from '@/common/decorators';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetPublicNewsService } from './services/get-public-news/get-public-news.service';
import { ListPublicNewsInputDTO } from './services/list-public-news/list-public-news.input';
import { ListPublicNewsService } from './services/list-public-news/list-public-news.service';

@Controller('news')
export class NewsController {
  public constructor(
    private readonly listPublicNewsService: ListPublicNewsService,
    private readonly getPublicNewsService: GetPublicNewsService,
  ) {}

  @Get()
  @IsPublicRoute()
  public async list(@Query() query: ListPublicNewsInputDTO) {
    return this.listPublicNewsService.execute(query);
  }

  @Get(':idOrSlug')
  @IsPublicRoute()
  public async get(@Param('idOrSlug') idOrSlug: string) {
    return this.getPublicNewsService.execute(idOrSlug);
  }
}
