import { RequireAdmin } from '@/common/decorators';
import { CurrentUser } from '@/common/decorators';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { CreateNewsInputDTO } from './services/create-news/create-news.input';
import { CreateNewsService } from './services/create-news/create-news.service';
import { DeleteNewsInputDTO } from './services/delete-news/delete-news.input';
import { DeleteNewsService } from './services/delete-news/delete-news.service';
import { ListAdminNewsInputDTO } from './services/list-admin-news/list-admin-news.input';
import { ListAdminNewsService } from './services/list-admin-news/list-admin-news.service';
import { UpdateNewsInputDTO } from './services/update-news/update-news.input';
import { UpdateNewsService } from './services/update-news/update-news.service';

@Controller('admin/news')
@RequireAdmin()
export class AdminNewsController {
  public constructor(
    private readonly createNewsService: CreateNewsService,
    private readonly updateNewsService: UpdateNewsService,
    private readonly deleteNewsService: DeleteNewsService,
    private readonly listAdminNewsService: ListAdminNewsService,
  ) {}

  @Post('list')
  public async list(@Body() input: ListAdminNewsInputDTO) {
    return this.listAdminNewsService.execute(input);
  }

  @Post('create')
  public async create(@Body() input: CreateNewsInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.createNewsService.execute(input, currentUser);
  }

  @Post('update')
  public async update(@Body() input: UpdateNewsInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.updateNewsService.execute(input, currentUser);
  }

  @Post('delete')
  public async delete(@Body() input: DeleteNewsInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.deleteNewsService.execute(input, currentUser);
  }
}
