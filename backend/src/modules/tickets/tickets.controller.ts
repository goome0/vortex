import { CurrentUser } from '@/common/decorators';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AddTicketMessageInputDTO, CreateTicketInputDTO } from './tickets.input';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  public constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  public async create(@Body() input: CreateTicketInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.ticketsService.create(input, currentUser);
  }

  @Get('my')
  public async my(@CurrentUser() currentUser: CurrentUserDTO) {
    return this.ticketsService.listMyTickets(currentUser);
  }

  @Get(':id')
  public async get(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.ticketsService.getMyTicket(id, currentUser);
  }

  @Post(':id/messages')
  public async addMessage(
    @Param('id') id: string,
    @Body() input: AddTicketMessageInputDTO,
    @CurrentUser() currentUser: CurrentUserDTO,
  ) {
    return this.ticketsService.addUserMessage(id, input, currentUser);
  }

  @Post(':id/close')
  public async close(@Param('id') id: string, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.ticketsService.closeByUser(id, currentUser);
  }
}

