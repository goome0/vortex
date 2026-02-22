import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable } from '@nestjs/common';
import { VtxNewsEntity } from '@/database/entities/vtx-news.entity';
import { NewsHelpersService } from '../news-helpers/news-helpers.service';

type PublicNewsDetail = Pick<
  VtxNewsEntity,
  | 'id'
  | 'slug'
  | 'title'
  | 'excerpt'
  | 'content'
  | 'category'
  | 'badgeVariant'
  | 'featured'
  | 'readTime'
  | 'imageUrl'
  | 'publishedAt'
  | 'createdAt'
>;

@Injectable()
export class GetPublicNewsService {
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

    const data: PublicNewsDetail = {
      id: news.id,
      slug: news.slug,
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      category: news.category,
      badgeVariant: news.badgeVariant,
      featured: news.featured,
      readTime: news.readTime,
      imageUrl: news.imageUrl,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
    };

    return SuccessResponse.toJson({
      code: 'NEWS_GET_SUCCESS',
      message: 'News retrieved successfully',
      path: `/news/${idOrSlug}`,
      data,
      successCode: 200,
    });
  }
}
