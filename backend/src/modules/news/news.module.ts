import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VtxNewsEntity } from '@/database/entities/vtx-news.entity';
import { AdminLauncherController } from './admin-launcher.controller';
import { AdminNewsController } from './admin-news.controller';
import { LauncherController } from './launcher.controller';
import { NewsController } from './news.controller';
import { NewsSeedService } from './news.seed';
import { CreateNewsModule } from './services/create-news/create-news.module';
import { DeleteNewsModule } from './services/delete-news/delete-news.module';
import { GetLauncherConfigModule } from './services/get-launcher-config/get-launcher-config.module';
import { GetPublicNewsModule } from './services/get-public-news/get-public-news.module';
import { LauncherGetNewsModule } from './services/launcher-get-news/launcher-get-news.module';
import { LauncherListNewsModule } from './services/launcher-list-news/launcher-list-news.module';
import { ListAdminNewsModule } from './services/list-admin-news/list-admin-news.module';
import { ListPublicNewsModule } from './services/list-public-news/list-public-news.module';
import { UpdateLauncherConfigModule } from './services/update-launcher-config/update-launcher-config.module';
import { UpdateNewsModule } from './services/update-news/update-news.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VtxNewsEntity]),
    CreateNewsModule,
    UpdateNewsModule,
    DeleteNewsModule,
    ListAdminNewsModule,
    ListPublicNewsModule,
    GetPublicNewsModule,
    LauncherListNewsModule,
    LauncherGetNewsModule,
    GetLauncherConfigModule,
    UpdateLauncherConfigModule,
  ],
  controllers: [NewsController, AdminNewsController, LauncherController, AdminLauncherController],
  providers: [NewsSeedService],
})
export class NewsModule {}
