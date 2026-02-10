import { RequireAdmin } from '@/common/decorators';
import { ServerControlGuard } from '@/common/guards/server-control.guard';
import { SuccessResponse } from '@/common/responses/success-response';
import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ServerControlCommandInputDTO } from './server-control.input';
import { ServerControlService } from './server-control.service';

@Controller('admin/server')
@RequireAdmin()
@UseGuards(ServerControlGuard)
export class ServerControlController {
  public constructor(private readonly serverControlService: ServerControlService) {}

  @Get('targets')
  public async targets() {
    const targets = this.serverControlService.getTargets();
    return SuccessResponse.toJson({
      code: 'SERVER_CONTROL_TARGETS_SUCCESS',
      message: 'Targets retrieved successfully',
      path: '/admin/server/targets',
      data: { targets },
      successCode: HttpStatus.OK,
    });
  }

  @Post(':id/status')
  public async status(@Param('id') id: string, @Body() input: ServerControlCommandInputDTO) {
    const result = await this.serverControlService.run(id, 'status', input.dryRun === true);
    return SuccessResponse.toJson({
      code: 'SERVER_CONTROL_RUN_SUCCESS',
      message: 'Command executed successfully',
      path: `/admin/server/${id}/status`,
      data: result,
      successCode: HttpStatus.OK,
    });
  }

  @Post(':id/start')
  public async start(@Param('id') id: string, @Body() input: ServerControlCommandInputDTO) {
    const result = await this.serverControlService.run(id, 'start', input.dryRun === true);
    return SuccessResponse.toJson({
      code: 'SERVER_CONTROL_RUN_SUCCESS',
      message: 'Command executed successfully',
      path: `/admin/server/${id}/start`,
      data: result,
      successCode: HttpStatus.OK,
    });
  }

  @Post(':id/stop')
  public async stop(@Param('id') id: string, @Body() input: ServerControlCommandInputDTO) {
    const result = await this.serverControlService.run(id, 'stop', input.dryRun === true);
    return SuccessResponse.toJson({
      code: 'SERVER_CONTROL_RUN_SUCCESS',
      message: 'Command executed successfully',
      path: `/admin/server/${id}/stop`,
      data: result,
      successCode: HttpStatus.OK,
    });
  }

  @Post(':id/restart')
  public async restart(@Param('id') id: string, @Body() input: ServerControlCommandInputDTO) {
    const result = await this.serverControlService.run(id, 'restart', input.dryRun === true);
    return SuccessResponse.toJson({
      code: 'SERVER_CONTROL_RUN_SUCCESS',
      message: 'Command executed successfully',
      path: `/admin/server/${id}/restart`,
      data: result,
      successCode: HttpStatus.OK,
    });
  }
}

