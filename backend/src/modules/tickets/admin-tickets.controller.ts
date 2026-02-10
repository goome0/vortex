import { RequireAdmin } from '@/common/decorators';
import { CurrentUser } from '@/common/decorators';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AddTicketMessageInputDTO, ResolveTicketInputDTO } from './tickets.input';
import { TicketsService } from './tickets.service';

@Controller('admin/tickets')
@RequireAdmin()
export class AdminTicketsController {
  public constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  public async listAll(@CurrentUser() currentUser: CurrentUserDTO) {
    return this.ticketsService.listAll(currentUser);
  }

  @Get(':id')
  public async get(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.ticketsService.getByAdmin(id, currentUser);
  }

  @Post(':id/messages')
  public async addMessage(
    @Param('id') id: string,
    @Body() input: AddTicketMessageInputDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.ticketsService.addAdminMessage(id, input, currentUser);
  }

  @Post(':id/resolve')
  public async resolve(
    @Param('id') id: string,
    @Body() input: ResolveTicketInputDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.ticketsService.resolve(id, input, currentUser);
  }
}

