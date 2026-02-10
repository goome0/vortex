import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';

@Module({
  imports: [ImagineModule],
  providers: [ResetPasswordService],
  exports: [ResetPasswordService],
})
export class ResetPasswordModule {}
