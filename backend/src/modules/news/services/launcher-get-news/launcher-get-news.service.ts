import { Injectable } from '@nestjs/common';
import { NewsHelpersService } from '../news-helpers/news-helpers.service';

type LauncherNewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  badge: string;
  badgeClass: string;
  badgeColor: string | null;
  badgeTextColor: string | null;
  action: string;
  img: string | null;
  cardImageUrl: string | null;
  heroImageUrl: string | null;
  content: string;
  publishedAt: string | null;
};

@Injectable()
export class LauncherGetNewsService {
  public constructor(private readonly newsHelpers: NewsHelpersService) {}

  public async execute(idOrSlug: string) {
    const raw = String(idOrSlug ?? '').trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw);

    const repo = this.newsHelpers.getRepository();
    const news = await repo.findOne({
      where: isUuid ? ({ id: raw } as any) : ({ slug: raw } as any),
    });
    if (!news) this.newsHelpers.notFound();
    if (!news.isPublished) this.newsHelpers.notFound();
    if (news.publishedAt && news.publishedAt > this.newsHelpers.now()) this.newsHelpers.notFound();

    const img = this.newsHelpers.resolveAssetUrl(news.imageUrl);
    const publishedAt = (news.publishedAt ?? news.createdAt ?? null)
      ? (news.publishedAt ?? news.createdAt).toISOString()
      : null;

    const data: LauncherNewsItem = {
      id: news.id,
      slug: news.slug,
      title: news.title,
      excerpt: news.excerpt ?? null,
      badge: (news.category ?? 'UPDATE').toUpperCase(),
      badgeClass: this.newsHelpers.badgeClassForVariant(news.badgeVariant),
      badgeColor: news.badgeColor?.trim() ?? null,
      badgeTextColor: news.badgeTextColor?.trim() ?? null,
      action: '/ Read more',
      img,
      cardImageUrl: img,
      heroImageUrl: img,
      content: this.newsHelpers.contentToHtml(news.content),
      publishedAt,
    };

    return data;
  }
}
