import { ImagineModule } from '@/common/imagine/imagine.module';
import { Module } from '@nestjs/common';
import { SignInService } from './sign-in.service';

@Module({
  imports: [ImagineModule],
  providers: [SignInService],
  exports: [SignInService],
})
export class SignInModule {}
