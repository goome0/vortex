import { Injectable } from '@nestjs/common';
import { NewsHelpersService } from '../news-helpers/news-helpers.service';
import { LauncherListNewsInputDTO } from './launcher-list-news.input';

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
export class LauncherListNewsService {
  public constructor(private readonly newsHelpers: NewsHelpersService) {}

  public async execute(input?: LauncherListNewsInputDTO) {
    const limit = Math.min(50, Math.max(1, input?.limit ?? 24));

    const repo = this.newsHelpers.getRepository();
    const qb = repo
      .createQueryBuilder('n')
      .where('n.isPublished = 1')
      .andWhere('(n.publishedAt IS NULL OR n.publishedAt <= :now)', {
        now: this.newsHelpers.now(),
      })
      .orderBy('n.featured', 'DESC')
      .addOrderBy('n.publishedAt', 'DESC')
      .addOrderBy('n.createdAt', 'DESC')
      .take(limit);

    const items = await qb.getMany();

    const data: LauncherNewsItem[] = items.map((n) => {
      const img = this.newsHelpers.resolveAssetUrl(n.imageUrl);
      const publishedAt = (n.publishedAt ?? n.createdAt ?? null)
        ? (n.publishedAt ?? n.createdAt).toISOString()
        : null;

      return {
        id: n.id,
        slug: n.slug,
        title: n.title,
        excerpt: n.excerpt ?? null,
        badge: (n.category ?? 'UPDATE').toUpperCase(),
        badgeClass: this.newsHelpers.badgeClassForVariant(n.badgeVariant),
        badgeColor: n.badgeColor?.trim() ?? null,
        badgeTextColor: n.badgeTextColor?.trim() ?? null,
        action: '/ Read more',
        img,
        cardImageUrl: img,
        heroImageUrl: img,
        content: this.newsHelpers.contentToHtml(n.content),
        publishedAt,
      };
    });

    return data;
  }
}
