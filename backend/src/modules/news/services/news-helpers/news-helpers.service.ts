import { ErrorResponse } from '@/common/responses/error-response';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EVtxNewsBadgeVariant, VtxNewsEntity } from '@/database/entities/vtx-news.entity';

@Injectable()
export class NewsHelpersService {
  public constructor(
    @InjectRepository(VtxNewsEntity)
    private readonly newsRepository: Repository<VtxNewsEntity>,
    private readonly configService: ConfigService,
  ) {}

  public now(): Date {
    return new Date();
  }

  public normalizeSlug(input: string): string {
    const s = String(input ?? '').trim().toLowerCase();
    const cleaned = s
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
    return cleaned.slice(0, 96) || 'news';
  }

  private shortRand(): string {
    return Math.random().toString(36).slice(2, 8);
  }

  public async ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
    const normalized = this.normalizeSlug(base);
    let attempt = normalized;
    for (let i = 0; i < 6; i++) {
      const qb = this.newsRepository.createQueryBuilder('n').where('n.slug = :slug', { slug: attempt });
      if (excludeId) qb.andWhere('n.id != :id', { id: excludeId });
      const existing = await qb.getOne();
      if (!existing) return attempt;
      attempt = `${normalized}-${this.shortRand()}`.slice(0, 96);
    }
    return `${normalized}-${Date.now().toString(36)}`.slice(0, 96);
  }

  public computeReadTime(content: string | null | undefined): string | null {
    const raw = (content ?? '').trim();
    if (!raw) return null;

    const text = raw.includes('<') ? raw.replace(/<[^>]+>/g, ' ') : raw;
    if (!text) return null;
    const words = text.split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 220));
    return `${mins} min`;
  }

  public badgeClassForVariant(variant: EVtxNewsBadgeVariant): string {
    switch (variant) {
      case EVtxNewsBadgeVariant.INFO:
        return 'patch';
      case EVtxNewsBadgeVariant.WARNING:
        return 'esports';
      case EVtxNewsBadgeVariant.DANGER:
        return 'update';
      case EVtxNewsBadgeVariant.DEFAULT:
      default:
        return 'update';
    }
  }

  public resolveAssetUrl(url: string | null | undefined): string | null {
    const raw = (url ?? '').trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;

    const base = (this.configService.get<string>('LAUNCHER_ASSETS_BASE_URL') ?? '').trim();
    if (!base) return raw;

    const baseNoSlash = base.endsWith('/') ? base.slice(0, -1) : base;
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    return `${baseNoSlash}${path}`;
  }

  public contentToHtml(content: string | null | undefined): string {
    const raw = (content ?? '').trim();
    if (!raw) return '';
    if (raw.includes('<') && raw.includes('>')) return raw;

    const paragraphs = raw
      .split(/\n{2,}/g)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => p.replace(/\n/g, '<br/>'));

    return paragraphs.map((p) => `<p>${p}</p>`).join('');
  }

  public defaultVariantForCategory(category?: string | null): EVtxNewsBadgeVariant {
    const c = (category ?? '').toLowerCase();
    if (c.includes('major')) return EVtxNewsBadgeVariant.DANGER;
    if (c.includes('event')) return EVtxNewsBadgeVariant.WARNING;
    if (c.includes('patch')) return EVtxNewsBadgeVariant.INFO;
    if (c.includes('maintenance')) return EVtxNewsBadgeVariant.DEFAULT;
    if (c.includes('content')) return EVtxNewsBadgeVariant.INFO;
    return EVtxNewsBadgeVariant.DEFAULT;
  }

  public notFound(): never {
    throw ErrorResponse.toHttpException({
      message: 'News not found',
      statusCode: HttpStatus.NOT_FOUND,
      code: 'NEWS_NOT_FOUND',
    });
  }

  public async clearFeaturedIfNeeded(nextFeatured: boolean, currentId?: string): Promise<void> {
    if (!nextFeatured) return;
    await this.newsRepository
      .createQueryBuilder()
      .update(VtxNewsEntity)
      .set({ featured: false })
      .where('featured = 1')
      .andWhere(currentId ? 'id != :id' : '1=1', currentId ? { id: currentId } : {})
      .execute();
  }

  public getRepository(): Repository<VtxNewsEntity> {
    return this.newsRepository;
  }
}
