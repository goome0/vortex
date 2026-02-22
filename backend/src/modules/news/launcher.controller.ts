import { IsPublicRoute } from '@/common/decorators';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetLauncherConfigService } from './services/get-launcher-config/get-launcher-config.service';
import { LauncherGetNewsService } from './services/launcher-get-news/launcher-get-news.service';
import { LauncherListNewsInputDTO } from './services/launcher-list-news/launcher-list-news.input';
import { LauncherListNewsService } from './services/launcher-list-news/launcher-list-news.service';

@Controller('launcher')
export class LauncherController {
  public constructor(
    private readonly getLauncherConfigService: GetLauncherConfigService,
    private readonly launcherListNewsService: LauncherListNewsService,
    private readonly launcherGetNewsService: LauncherGetNewsService,
  ) {}

  @Get('config')
  @IsPublicRoute()
  public async config(@Query() query: LauncherListNewsInputDTO) {
    const [config, news] = await Promise.all([
      this.getLauncherConfigService.execute(),
      this.launcherListNewsService.execute(query),
    ]);

    return {
      schemaVersion: 1,
      ui: config.ui,
      hero: config.hero,
      background: config.background,
      news,
    };
  }

  @Get('news')
  @IsPublicRoute()
  public async news(@Query() query: LauncherListNewsInputDTO) {
    return this.launcherListNewsService.execute(query);
  }

  @Get('news/:idOrSlug')
  @IsPublicRoute()
  public async newsGet(@Param('idOrSlug') idOrSlug: string) {
    return this.launcherGetNewsService.execute(idOrSlug);
  }
}
