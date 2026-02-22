import { RequireAdmin } from '@/common/decorators';
import { Body, Controller, Put } from '@nestjs/common';
import { UpdateLauncherConfigInputDTO } from './services/update-launcher-config/update-launcher-config.input';
import { UpdateLauncherConfigService } from './services/update-launcher-config/update-launcher-config.service';

@Controller('admin/launcher')
@RequireAdmin()
export class AdminLauncherController {
  public constructor(private readonly updateLauncherConfigService: UpdateLauncherConfigService) {}

  @Put('config')
  public async updateConfig(@Body() input: UpdateLauncherConfigInputDTO) {
    return this.updateLauncherConfigService.execute(input);
  }
}
