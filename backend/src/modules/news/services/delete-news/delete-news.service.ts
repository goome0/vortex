import { AppLogger } from '@/common/app-logger';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { SuccessResponse } from '@/common/responses/success-response';
import { Injectable } from '@nestjs/common';
import { NewsHelpersService } from '../news-helpers/news-helpers.service';
import { DeleteNewsInputDTO } from './delete-news.input';

@Injectable()
export class DeleteNewsService {
  public constructor(
    private readonly logger: AppLogger,
    private readonly newsHelpers: NewsHelpersService,
  ) {}

  public async execute(input: DeleteNewsInputDTO, currentUser: CurrentUserDTO) {
    const repo = this.newsHelpers.getRepository();
    const news = await repo.findOne({ where: { id: input.id } });
    if (!news) this.newsHelpers.notFound();

    await repo.delete({ id: news.id });

    this.logger.log(`News deleted ${news.id} by ${currentUser.username}`);

    return SuccessResponse.toJson({
      code: 'ADMIN_NEWS_DELETE_SUCCESS',
      message: 'News deleted successfully',
      path: '/admin/news/delete',
      successCode: 200,
    });
  }
}
