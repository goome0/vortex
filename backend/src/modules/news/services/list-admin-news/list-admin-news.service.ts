import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable } from '@nestjs/common';
import { NewsHelpersService } from '../news-helpers/news-helpers.service';
import { ListAdminNewsInputDTO } from './list-admin-news.input';

@Injectable()
export class ListAdminNewsService {
  public constructor(private readonly newsHelpers: NewsHelpersService) {}

  public async execute(input: ListAdminNewsInputDTO) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const skip = (page - 1) * limit;

    const repo = this.newsHelpers.getRepository();
    const qb = repo.createQueryBuilder('n');
    if (input.onlyPublished) qb.where('n.isPublished = 1');
    if (input.category) qb.andWhere('n.category = :category', { category: input.category });
    if (input.q)
      qb.andWhere('(n.title LIKE :q OR n.excerpt LIKE :q OR n.slug LIKE :q)', {
        q: `%${input.q}%`,
      });

    qb.orderBy('n.isPublished', 'DESC')
      .addOrderBy('n.featured', 'DESC')
      .addOrderBy('n.publishedAt', 'DESC')
      .addOrderBy('n.updatedAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return SuccessResponse.toJson({
      code: 'ADMIN_NEWS_LIST_SUCCESS',
      message: 'News retrieved successfully',
      path: '/admin/news/list',
      data: {
        items,
        total,
        page,
        limit,
      },
      successCode: 200,
    });
  }
}
