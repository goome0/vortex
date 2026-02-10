import { ErrorResponse } from '@/common/responses/error-response';
import { SuccessResponse } from '@/common/responses/success-response';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EVtxNewsBadgeVariant, VtxNewsEntity } from '@/database/entities/vtx-news.entity';
import {
  AdminCreateNewsInputDTO,
  AdminDeleteNewsInputDTO,
  AdminListNewsInputDTO,
  AdminUpdateNewsInputDTO,
  PublicListNewsQueryDTO,
} from './news.input';

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

type PublicNewsDetail = PublicNewsListItem & Pick<VtxNewsEntity, 'content'>;

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  public constructor(
    @InjectRepository(VtxNewsEntity)
    private readonly newsRepository: Repository<VtxNewsEntity>,
  ) {}

  private now(): Date {
    return new Date();
  }

  private normalizeSlug(input: string): string {
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

  private async ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
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

  private computeReadTime(content: string | null | undefined): string | null {
    const text = (content ?? '').trim();
    if (!text) return null;
    const words = text.split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 220));
    return `${mins} min`;
  }

  private defaultVariantForCategory(category?: string | null): EVtxNewsBadgeVariant {
    const c = (category ?? '').toLowerCase();
    if (c.includes('major')) return EVtxNewsBadgeVariant.DANGER;
    if (c.includes('event')) return EVtxNewsBadgeVariant.WARNING;
    if (c.includes('patch')) return EVtxNewsBadgeVariant.INFO;
    if (c.includes('maintenance')) return EVtxNewsBadgeVariant.DEFAULT;
    if (c.includes('content')) return EVtxNewsBadgeVariant.INFO;
    return EVtxNewsBadgeVariant.DEFAULT;
  }

  private notFound(): never {
    throw ErrorResponse.toHttpException({
      message: 'News not found',
      statusCode: HttpStatus.NOT_FOUND,
      code: 'NEWS_NOT_FOUND',
    });
  }

  private async clearFeaturedIfNeeded(nextFeatured: boolean, currentId?: string) {
    if (!nextFeatured) return;
    // Keep at most one featured item.
    await this.newsRepository
      .createQueryBuilder()
      .update(VtxNewsEntity)
      .set({ featured: false })
      .where('featured = 1')
      .andWhere(currentId ? 'id != :id' : '1=1', currentId ? { id: currentId } : {})
      .execute();
  }

  // -------- Public --------
  public async publicList(query: PublicListNewsQueryDTO) {
    const limit = query.limit ?? 8;

    const qb = this.newsRepository
      .createQueryBuilder('n')
      .where('n.isPublished = 1')
      .andWhere('(n.publishedAt IS NULL OR n.publishedAt <= :now)', { now: this.now() });

    if (query.category) qb.andWhere('n.category = :category', { category: query.category });
    if (query.q) qb.andWhere('(n.title LIKE :q OR n.excerpt LIKE :q)', { q: `%${query.q}%` });

    qb.orderBy('n.featured', 'DESC')
      .addOrderBy('n.publishedAt', 'DESC')
      .addOrderBy('n.createdAt', 'DESC')
      .take(limit);

    const items = await qb.getMany();

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
      data,
    });
  }

  public async publicGet(idOrSlug: string) {
    const raw = String(idOrSlug ?? '').trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw);

    const news = await this.newsRepository.findOne({
      where: isUuid ? ({ id: raw } as any) : ({ slug: raw } as any),
    });
    if (!news) this.notFound();
    if (!news.isPublished) this.notFound();
    if (news.publishedAt && news.publishedAt > this.now()) this.notFound();

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
    });
  }

  // -------- Admin --------
  public async adminList(input: AdminListNewsInputDTO, currentUser: CurrentUserDTO) {
    const limit = input.limit ?? 50;

    const qb = this.newsRepository.createQueryBuilder('n');
    if (input.onlyPublished) qb.where('n.isPublished = 1');
    if (input.category) qb.andWhere('n.category = :category', { category: input.category });
    if (input.q) qb.andWhere('(n.title LIKE :q OR n.excerpt LIKE :q OR n.slug LIKE :q)', { q: `%${input.q}%` });

    qb.orderBy('n.isPublished', 'DESC')
      .addOrderBy('n.featured', 'DESC')
      .addOrderBy('n.publishedAt', 'DESC')
      .addOrderBy('n.updatedAt', 'DESC')
      .take(limit);

    const items = await qb.getMany();

    return SuccessResponse.toJson({
      code: 'ADMIN_NEWS_LIST_SUCCESS',
      message: 'News retrieved successfully',
      path: '/admin/news/list',
      data: items,
    });
  }

  public async adminCreate(input: AdminCreateNewsInputDTO, currentUser: CurrentUserDTO) {
    const desiredSlug = input.slug?.trim() || input.title;
    const slug = await this.ensureUniqueSlug(desiredSlug);

    const featured = !!input.featured;
    await this.clearFeaturedIfNeeded(featured);

    const isPublished = !!input.isPublished;
    const publishedAt = isPublished ? this.now() : null;

    const badgeVariant =
      input.badgeVariant ?? this.defaultVariantForCategory(input.category ?? null);

    const entity = this.newsRepository.create({
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt?.trim() ?? null,
      content: input.content?.trim() ?? null,
      category: input.category?.trim() ?? null,
      badgeVariant,
      featured,
      readTime: input.readTime?.trim() ?? this.computeReadTime(input.content),
      imageUrl: input.imageUrl?.trim() ?? null,
      isPublished,
      publishedAt,
      createdByUsername: currentUser.username,
      updatedByUsername: currentUser.username,
    });

    const saved = await this.newsRepository.save(entity);

    this.logger.log(`News created ${saved.id} by ${currentUser.username}`);

    return SuccessResponse.toJson({
      code: 'ADMIN_NEWS_CREATE_SUCCESS',
      message: 'News created successfully',
      path: '/admin/news/create',
      data: saved,
      successCode: HttpStatus.CREATED,
    });
  }

  public async adminUpdate(input: AdminUpdateNewsInputDTO, currentUser: CurrentUserDTO) {
    const news = await this.newsRepository.findOne({ where: { id: input.id } });
    if (!news) this.notFound();

    const nextTitle = input.title != null ? input.title.trim() : news.title;

    let nextSlug = news.slug;
    if (input.slug != null) {
      nextSlug = await this.ensureUniqueSlug(input.slug, news.id);
    } else if (input.title != null) {
      // Keep slug stable by default; only change if explicitly requested.
      nextSlug = news.slug;
    }

    const nextFeatured = input.featured != null ? !!input.featured : news.featured;
    await this.clearFeaturedIfNeeded(nextFeatured, news.id);

    const nextIsPublished = input.isPublished != null ? !!input.isPublished : news.isPublished;
    const nextPublishedAt =
      nextIsPublished && !news.isPublished ? this.now() : nextIsPublished ? news.publishedAt ?? this.now() : null;

    const nextCategory = input.category !== undefined ? (input.category?.trim() ?? null) : news.category;
    const nextVariant =
      input.badgeVariant ?? (input.category !== undefined ? this.defaultVariantForCategory(nextCategory) : news.badgeVariant);

    const nextContent = input.content !== undefined ? (input.content?.trim() ?? null) : news.content;
    const nextReadTime =
      input.readTime !== undefined
        ? (input.readTime?.trim() ?? null)
        : news.readTime ?? this.computeReadTime(nextContent);

    await this.newsRepository.update(
      { id: news.id },
      {
        title: nextTitle,
        slug: nextSlug,
        excerpt: input.excerpt !== undefined ? (input.excerpt?.trim() ?? null) : news.excerpt,
        content: nextContent,
        category: nextCategory,
        badgeVariant: nextVariant,
        featured: nextFeatured,
        readTime: nextReadTime,
        imageUrl: input.imageUrl !== undefined ? (input.imageUrl?.trim() ?? null) : news.imageUrl,
        isPublished: nextIsPublished,
        publishedAt: nextPublishedAt,
        updatedByUsername: currentUser.username,
      },
    );

    const updated = await this.newsRepository.findOne({ where: { id: news.id } });
    if (!updated) this.notFound();

    this.logger.log(`News updated ${updated.id} by ${currentUser.username}`);

    return SuccessResponse.toJson({
      code: 'ADMIN_NEWS_UPDATE_SUCCESS',
      message: 'News updated successfully',
      path: '/admin/news/update',
      data: updated,
      successCode: HttpStatus.OK,
    });
  }

  public async adminDelete(input: AdminDeleteNewsInputDTO, currentUser: CurrentUserDTO) {
    const news = await this.newsRepository.findOne({ where: { id: input.id } });
    if (!news) this.notFound();

    await this.newsRepository.delete({ id: news.id });

    this.logger.log(`News deleted ${news.id} by ${currentUser.username}`);

    return SuccessResponse.toJson({
      code: 'ADMIN_NEWS_DELETE_SUCCESS',
      message: 'News deleted successfully',
      path: '/admin/news/delete',
      successCode: HttpStatus.OK,
    });
  }
}

