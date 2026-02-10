import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { PostItemsService } from './post-items.service';

@Module({
  imports: [ImagineModule],
  providers: [PostItemsService],
  exports: [PostItemsService],
})
export class PostItemsModule {}
