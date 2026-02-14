import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { DeleteAllPromosService } from './delete-all-promos.service';
import { DeleteManyPromosService } from './delete-many-promos.service';

@Module({
  imports: [ImagineModule],
  providers: [DeleteManyPromosService, DeleteAllPromosService],
  exports: [DeleteManyPromosService, DeleteAllPromosService],
})
export class PromoBulkDeleteModule {}

