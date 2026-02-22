import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable } from '@nestjs/common';
import { VtxNewsEntity } from '@/database/entities/vtx-news.entity';
import { NewsHelpersService } from '../news-helpers/news-helpers.service';
import { ListPublicNewsInputDTO } from './list-public-news.input';

type PublicNewsListItem = Pick<
  VtxNewsEntity,
  | 'id'
  | 'slug'
  | 'title'
  | 'excerpt'
  | 'category'
  | 'badgeVariant'
  | 'featured'
  | 'readTime'
  | 'imageUrl'
  | 'publishedAt'
  | 'createdAt'
>;

@Injectable()
export class ListPublicNewsService {
  public constructor(private readonly newsHelpers: NewsHelpersService) {}

  public async execute(input: ListPublicNewsInputDTO) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 12;
    const skip = (page - 1) * limit;

    const repo = this.newsHelpers.getRepository();
    const qb = repo
      .createQueryBuilder('n')
      .where('n.isPublished = 1')
      .andWhere('(n.publishedAt IS NULL OR n.publishedAt <= :now)', {
        now: this.newsHelpers.now(),
      });

    if (input.category) qb.andWhere('n.category = :category', { category: input.category });
    if (input.q) qb.andWhere('(n.title LIKE :q OR n.excerpt LIKE :q)', { q: `%${input.q}%` });

    qb.orderBy('n.featured', 'DESC')
      .addOrderBy('n.publishedAt', 'DESC')
      .addOrderBy('n.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    const data: PublicNewsListItem[] = items.map((n) => ({
      id: n.id,
      slug: n.slug,
      title: n.title,
      excerpt: n.excerpt,
      category: n.category,
      badgeVariant: n.badgeVariant,
      featured: n.featured,
      readTime: n.readTime,
      imageUrl: n.imageUrl,
      publishedAt: n.publishedAt,
      createdAt: n.createdAt,
    }));

    return SuccessResponse.toJson({
      code: 'NEWS_LIST_SUCCESS',
      message: 'News retrieved successfully',
      path: '/news',
      data: {
        items: data,
        total,
        page,
        limit,
      },
      successCode: 200,
    });
  }
}
