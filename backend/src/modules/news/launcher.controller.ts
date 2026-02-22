import { IsPublicRoute } from '@/common/decorators';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { NewsService } from './news.service';

class LauncherListQueryDTO {
  @IsOptional()
  @Transform(({ value }) => (value == null ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  public limit?: number;
}

@Controller('launcher')
export class LauncherController {
  public constructor(
    private readonly newsService: NewsService,
    private readonly configService: ConfigService,
  ) {}

  @Get('config')
  @IsPublicRoute()
  public async config(@Query() query: LauncherListQueryDTO) {
    const assetsBaseUrl = (this.configService.get<string>('LAUNCHER_ASSETS_BASE_URL') ?? '').trim();

    const resolveAssetUrl = (url: string | null) => {
      const raw = (url ?? '').trim();
      if (!raw) return null;
      if (/^https?:\/\//i.test(raw)) return raw;
      if (!assetsBaseUrl) return raw;
      const baseNoSlash = assetsBaseUrl.endsWith('/') ? assetsBaseUrl.slice(0, -1) : assetsBaseUrl;
      const path = raw.startsWith('/') ? raw : `/${raw}`;
      return `${baseNoSlash}${path}`;
    };

    const backgroundUrl = this.configService.get<string>('LAUNCHER_BACKGROUND_URL') ?? null;
    const backgroundAlt = this.configService.get<string>('LAUNCHER_BACKGROUND_ALT') ?? null;
    const limit = query.limit;

    const news = await this.newsService.launcherList({ limit });

    return {
      schemaVersion: 1,
      hero: {
        subtitle: this.configService.get<string>('LAUNCHER_HERO_SUBTITLE') ?? 'PLAY FOR FREE',
        title: this.configService.get<string>('LAUNCHER_HERO_TITLE') ?? 'Prometheon',
        description:
          this.configService.get<string>('LAUNCHER_HERO_DESCRIPTION') ??
          'Explore a living world, master your skills, craft your gear, and face epic challenges in an MMORPG built for adventure.',
      },
      background: {
        url: resolveAssetUrl(backgroundUrl),
        alt: backgroundAlt,
        updatedAt: new Date().toISOString(),
      },
      news,
    };
  }

  @Get('news')
  @IsPublicRoute()
  public async news(@Query() query: LauncherListQueryDTO) {
    const limit = query.limit;
    return this.newsService.launcherList({ limit });
  }

  @Get('news/:idOrSlug')
  @IsPublicRoute()
  public async newsGet(@Param('idOrSlug') idOrSlug: string) {
    return this.newsService.launcherGet(idOrSlug);
  }
}
