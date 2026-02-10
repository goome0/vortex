import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { SignUpService } from './sign-up.service';

@Module({
  imports: [ImagineModule],
  providers: [SignUpService],
  exports: [SignUpService],
})
export class SignUpModule {}
