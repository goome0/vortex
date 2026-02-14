import { RequireAdmin } from '@/common/decorators';
import { CurrentUser } from '@/common/decorators';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AddCaseMessageInputDTO, AdminListCasesQueryDTO, ResolveCaseInputDTO } from './cases.input';
import { CasesService } from './cases.service';

@Controller('admin/cases')
@RequireAdmin()
export class AdminCasesController {
  public constructor(private readonly casesService: CasesService) {}

  @Get()
  public async listAll(
    @Query() query: AdminListCasesQueryDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.casesService.listAll(currentUser, query);
  }

  @Get(':id')
  public async get(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.casesService.getByAdmin(id, currentUser);
  }

  @Post(':id/messages')
  public async addMessage(
    @Param('id') id: string,
    @Body() input: AddCaseMessageInputDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.casesService.addAdminMessage(id, input, currentUser);
  }

  @Post(':id/resolve')
  public async resolve(
    @Param('id') id: string,
    @Body() input: ResolveCaseInputDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.casesService.resolve(id, input, currentUser);
  }
}
