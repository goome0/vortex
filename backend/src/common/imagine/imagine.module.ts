import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DatabaseRepositoriesModule } from '@/database/database-repositories.module';
import { CompHackAuthService } from './comp-hack-auth.service';
import { ImagineService } from './imagine.service';

@Module({
  imports: [HttpModule, DatabaseRepositoriesModule],
  providers: [ImagineService, CompHackAuthService],
  exports: [ImagineService, CompHackAuthService],
})
export class ImagineModule {}
