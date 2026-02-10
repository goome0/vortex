import { CurrentUser } from '@/common/decorators';
import { CurrentUserDTO } from '@/common/dto/current-user.dto';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { GetCoinsService } from './services/get-coins/get-coins.service';
import { StartService } from './services/start/start.service';
import { UpdateService } from './services/update/update.service';
import { WebGameStartInputDTO, WebGameUpdateInputDTO } from './webgame.input';

@Controller('webgame')
export class WebGameController {
  public constructor(
    private readonly getCoinsService: GetCoinsService,
    private readonly startService: StartService,
    private readonly updateService: UpdateService,
  ) {}

  @Get('coins')
  public async getCoins(@CurrentUser() currentUser: CurrentUserDTO) {
    return this.getCoinsService.execute(currentUser);
  }

  @Post('start')
  public async start(@Body() input: WebGameStartInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.startService.execute(input, currentUser);
  }

  @Post('update')
  public async update(@Body() input: WebGameUpdateInputDTO, @CurrentUser() currentUser: CurrentUserDTO) {
    return this.updateService.execute(input, currentUser);
  }
}
