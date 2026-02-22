import { AppLogger } from '@/common/app-logger';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable } from '@nestjs/common';
import { NewsHelpersService } from '../news-helpers/news-helpers.service';
import { UpdateNewsInputDTO } from './update-news.input';

@Injectable()
export class UpdateNewsService {
  public constructor(
    private readonly logger: AppLogger,
    private readonly newsHelpers: NewsHelpersService,
  ) {}

  public async execute(input: UpdateNewsInputDTO, currentUser: CurrentUserDTO) {
    const repo = this.newsHelpers.getRepository();
    const news = await repo.findOne({ where: { id: input.id } });
    if (!news) this.newsHelpers.notFound();

    const nextTitle = input.title != null ? input.title.trim() : news.title;

    let nextSlug = news.slug;
    if (input.slug != null) {
      nextSlug = await this.newsHelpers.ensureUniqueSlug(input.slug, news.id);
    }

    const nextFeatured = input.featured != null ? !!input.featured : news.featured;
    await this.newsHelpers.clearFeaturedIfNeeded(nextFeatured, news.id);

    const nextIsPublished = input.isPublished != null ? !!input.isPublished : news.isPublished;
    const nextPublishedAt =
      nextIsPublished && !news.isPublished
        ? this.newsHelpers.now()
        : nextIsPublished
          ? news.publishedAt ?? this.newsHelpers.now()
          : null;

    const nextCategory =
      input.category !== undefined ? (input.category?.trim() ?? null) : news.category;
    const nextVariant =
      input.badgeVariant ??
      (input.category !== undefined ? this.newsHelpers.defaultVariantForCategory(nextCategory) : news.badgeVariant);

    const nextContentInput = input.contentHtml !== undefined ? input.contentHtml : input.content;
    const nextContent =
      nextContentInput !== undefined ? (nextContentInput?.trim() ?? null) : news.content;
    const nextReadTime =
      input.readTime !== undefined
        ? (input.readTime?.trim() ?? null)
        : news.readTime ?? this.newsHelpers.computeReadTime(nextContent);

    const nextImageInput =
      input.heroImageUrl !== undefined
        ? input.heroImageUrl
        : input.cardImageUrl !== undefined
          ? input.cardImageUrl
          : input.imageUrl;

    await repo.update(
      { id: news.id },
      {
        title: nextTitle,
        slug: nextSlug,
        excerpt: input.excerpt !== undefined ? (input.excerpt?.trim() ?? null) : news.excerpt,
        content: nextContent,
        category: nextCategory,
        badgeVariant: nextVariant,
        badgeColor: input.badgeColor !== undefined ? (input.badgeColor?.trim() ?? null) : news.badgeColor,
        badgeTextColor:
          input.badgeTextColor !== undefined ? (input.badgeTextColor?.trim() ?? null) : news.badgeTextColor,
        featured: nextFeatured,
        readTime: nextReadTime,
        imageUrl: nextImageInput !== undefined ? (nextImageInput?.trim() ?? null) : news.imageUrl,
        isPublished: nextIsPublished,
        publishedAt: nextPublishedAt,
        updatedByUsername: currentUser.username,
      },
    );

    const updated = await repo.findOne({ where: { id: news.id } });
    if (!updated) this.newsHelpers.notFound();

    this.logger.log(`News updated ${updated.id} by ${currentUser.username}`);

    return SuccessResponse.toJson({
      code: 'ADMIN_NEWS_UPDATE_SUCCESS',
      message: 'News updated successfully',
      path: '/admin/news/update',
      data: updated,
      successCode: 200,
    });
  }
}
