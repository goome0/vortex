import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { UpdateAccountService } from './update-account.service';

@Module({
  imports: [ImagineModule],
  providers: [UpdateAccountService],
  exports: [UpdateAccountService],
})
export class UpdateAccountModule {}
