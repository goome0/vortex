import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VtxLauncherConfigEntity } from '@/database/entities/vtx-launcher-config.entity';
import { GetLauncherConfigService } from './get-launcher-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([VtxLauncherConfigEntity])],
  providers: [GetLauncherConfigService],
  exports: [GetLauncherConfigService],
})
export class GetLauncherConfigModule {}
