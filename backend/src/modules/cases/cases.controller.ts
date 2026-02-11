import { CurrentUser } from '@/common/decorators';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AddCaseMessageInputDTO, CreateCaseInputDTO } from './cases.input';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  public constructor(private readonly casesService: CasesService) {}

  @Post()
  public async create(@Body() input: CreateCaseInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.casesService.create(input, currentUser);
  }

  @Get('my')
  public async my(@CurrentUser() currentUser: CurrentUserDTO) {
    return this.casesService.listMyCases(currentUser);
  }

  @Get(':id')
  public async get(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.casesService.getMyCase(id, currentUser);
  }

  @Post(':id/messages')
  public async addMessage(
    @Param('id') id: string,
    @Body() input: AddCaseMessageInputDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.casesService.addUserMessage(id, input, currentUser);
  }

  @Post(':id/close')
  public async close(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.casesService.closeByUser(id, currentUser);
  }
}
