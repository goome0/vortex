import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { DeleteAccountService } from './delete-account.service';

@Module({
  imports: [ImagineModule],
  providers: [DeleteAccountService],
  exports: [DeleteAccountService],
})
export class DeleteAccountModule {}
