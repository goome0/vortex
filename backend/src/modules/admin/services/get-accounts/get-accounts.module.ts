import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { GetAccountsService } from './get-accounts.service';

@Module({
  imports: [ImagineModule],
  providers: [GetAccountsService],
  exports: [GetAccountsService],
})
export class GetAccountsModule {}
