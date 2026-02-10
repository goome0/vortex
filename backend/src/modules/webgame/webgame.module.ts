import { Module } from '@nestjs/common';
import { WebGameController } from './webgame.controller';
import { GetCoinsModule } from './services/get-coins/get-coins.module';
import { StartModule } from './services/start/start.module';
import { UpdateModule } from './services/update/update.module';

@Module({
  imports: [GetCoinsModule, StartModule, UpdateModule],
  controllers: [WebGameController],
})
export class WebGameModule {}
