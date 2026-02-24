import { IsPublicRoute } from '@/common/decorators';
import { Controller, Get } from '@nestjs/common';
import { ServerStatusService } from './server-status.service';

@Controller('status')
export class ServerStatusController {
  public constructor(private readonly serverStatusService: ServerStatusService) {}

  @Get('servers')
  @IsPublicRoute()
  public async servers() {
    return this.serverStatusService.getStatus();
  }
}

