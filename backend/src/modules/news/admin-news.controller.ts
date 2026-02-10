import { RequireAdmin } from '@/common/decorators';
import { CurrentUser } from '@/common/decorators';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { NewsService } from './news.service';
import {
  AdminCreateNewsInputDTO,
  AdminDeleteNewsInputDTO,
  AdminListNewsInputDTO,
  AdminUpdateNewsInputDTO,
} from './news.input';

@Controller('admin/news')
@RequireAdmin()
export class AdminNewsController {
  public constructor(private readonly newsService: NewsService) {}

  @Post('list')
  public async list(@Body() input: AdminListNewsInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.newsService.adminList(input, currentUser);
  }

  @Post('create')
  public async create(@Body() input: AdminCreateNewsInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.newsService.adminCreate(input, currentUser);
  }

  @Post('update')
  public async update(@Body() input: AdminUpdateNewsInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.newsService.adminUpdate(input, currentUser);
  }

  @Post('delete')
  public async delete(@Body() input: AdminDeleteNewsInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.newsService.adminDelete(input, currentUser);
  }
}

