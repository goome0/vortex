import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VtxLauncherConfigEntity } from '@/database/entities/vtx-launcher-config.entity';

const DEFAULT_HERO_SUBTITLE = 'PLAY FOR FREE';
const DEFAULT_HERO_TITLE = 'Prometheon';
const DEFAULT_HERO_DESCRIPTION =
  'Explore a living world, master your skills, craft your gear, and face epic challenges in an MMORPG built for adventure.';

@Injectable()
export class GetLauncherConfigService {
  private readonly configId = 1;

  public constructor(
    @InjectRepository(VtxLauncherConfigEntity)
    private readonly configRepository: Repository<VtxLauncherConfigEntity>,
    private readonly configService: ConfigService,
  ) {}

  private resolveAssetUrl(url: string | null, assetsBaseUrl: string): string | null {
    const raw = (url ?? '').trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (!assetsBaseUrl) return raw;
    const baseNoSlash = assetsBaseUrl.endsWith('/') ? assetsBaseUrl.slice(0, -1) : assetsBaseUrl;
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    return `${baseNoSlash}${path}`;
  }

  public async execute(): Promise<{
    ui: {
      heroSubtitleColor: string | null;
      playButtonBackground: string | null;
      playButtonHoverBackground: string | null;
      playButtonTextColor: string | null;
    };
    hero: { subtitle: string; title: string; description: string };
    background: { url: string | null; alt: string | null; updatedAt: string };
  }> {
    const assetsBaseUrl = (this.configService.get<string>('LAUNCHER_ASSETS_BASE_URL') ?? '').trim();

    const dbRow = await this.configRepository.findOne({
      where: { id: this.configId },
    });

    const heroSubtitle =
      (dbRow?.heroSubtitle?.trim() ??
        (this.configService.get<string>('LAUNCHER_HERO_SUBTITLE') ?? '').trim()) ||
      DEFAULT_HERO_SUBTITLE;
    const heroTitle =
      (dbRow?.heroTitle?.trim() ??
        (this.configService.get<string>('LAUNCHER_HERO_TITLE') ?? '').trim()) ||
      DEFAULT_HERO_TITLE;
    const heroDescription =
      (dbRow?.heroDescription?.trim() ??
        (this.configService.get<string>('LAUNCHER_HERO_DESCRIPTION') ?? '').trim()) ||
      DEFAULT_HERO_DESCRIPTION;

    const backgroundUrlRaw =
      (dbRow?.backgroundUrl?.trim() ??
        (this.configService.get<string>('LAUNCHER_BACKGROUND_URL') ?? '').trim()) ||
      null;
    const backgroundAlt =
      (dbRow?.backgroundAlt?.trim() ??
        (this.configService.get<string>('LAUNCHER_BACKGROUND_ALT') ?? '').trim()) ||
      null;

    const backgroundUrlResolved = this.resolveAssetUrl(backgroundUrlRaw, assetsBaseUrl);

    return {
      ui: {
        heroSubtitleColor: dbRow?.heroSubtitleColor?.trim() || null,
        playButtonBackground: dbRow?.playButtonBackground?.trim() || null,
        playButtonHoverBackground: dbRow?.playButtonHoverBackground?.trim() || null,
        playButtonTextColor: dbRow?.playButtonTextColor?.trim() || null,
      },
      hero: {
        subtitle: heroSubtitle,
        title: heroTitle,
        description: heroDescription,
      },
      background: {
        url: backgroundUrlResolved,
        alt: backgroundAlt,
        updatedAt: (dbRow?.updatedAt ?? new Date()).toISOString(),
      },
    };
  }
}
