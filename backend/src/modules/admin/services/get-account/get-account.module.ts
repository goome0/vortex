import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { GetAccountService } from './get-account.service';

@Module({
  imports: [ImagineModule],
  providers: [GetAccountService],
  exports: [GetAccountService],
})
export class GetAccountModule {}
