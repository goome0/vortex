import { AppLogger } from '@/common/app-logger';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { HttpStatus, Injectable } from '@nestjs/common';
import { NewsHelpersService } from '../news-helpers/news-helpers.service';
import { CreateNewsInputDTO } from './create-news.input';

@Injectable()
export class CreateNewsService {
  public constructor(
    private readonly logger: AppLogger,
    private readonly newsHelpers: NewsHelpersService,
  ) {}

  public async execute(input: CreateNewsInputDTO, currentUser: CurrentUserDTO) {
    const desiredSlug = input.slug?.trim() || input.title;
    const slug = await this.newsHelpers.ensureUniqueSlug(desiredSlug);

    const featured = !!input.featured;
    await this.newsHelpers.clearFeaturedIfNeeded(featured);

    const isPublished = !!input.isPublished;
    const publishedAt = isPublished ? this.newsHelpers.now() : null;

    const badgeVariant = input.badgeVariant ?? this.newsHelpers.defaultVariantForCategory(input.category ?? null);

    const content = input.contentHtml ?? input.content ?? null;
    const imageUrl = input.heroImageUrl ?? input.cardImageUrl ?? input.imageUrl ?? null;

    const repo = this.newsHelpers.getRepository();
    const entity = repo.create({
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt?.trim() ?? null,
      content: content?.trim() ?? null,
      category: input.category?.trim() ?? null,
      badgeVariant,
      badgeColor: input.badgeColor?.trim() ?? null,
      badgeTextColor: input.badgeTextColor?.trim() ?? null,
      featured,
      readTime: input.readTime?.trim() ?? this.newsHelpers.computeReadTime(content),
      imageUrl: imageUrl?.trim() ?? null,
      isPublished,
      publishedAt,
      createdByUsername: currentUser.username,
      updatedByUsername: currentUser.username,
    });

    const saved = await repo.save(entity);

    this.logger.log(`News created ${saved.id} by ${currentUser.username}`);

    return SuccessResponse.toJson({
      code: 'ADMIN_NEWS_CREATE_SUCCESS',
      message: 'News created successfully',
      path: '/admin/news/create',
      data: saved,
      successCode: HttpStatus.CREATED,
    });
  }
}
