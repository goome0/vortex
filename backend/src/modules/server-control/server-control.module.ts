import { Module } from '@nestjs/common';
import { ServerControlController } from './server-control.controller';
import { ServerControlService } from './server-control.service';

@Module({
  controllers: [ServerControlController],
  providers: [ServerControlService],
})
export class ServerControlModule {}

