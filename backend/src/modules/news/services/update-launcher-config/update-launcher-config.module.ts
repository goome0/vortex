import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VtxLauncherConfigEntity } from '@/database/entities/vtx-launcher-config.entity';
import { UpdateLauncherConfigService } from './update-launcher-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([VtxLauncherConfigEntity])],
  providers: [UpdateLauncherConfigService],
  exports: [UpdateLauncherConfigService],
})
export class UpdateLauncherConfigModule {}
