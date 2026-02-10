import { Module } from '@nestjs/common';
import { AddCpService } from './add-cp.service';
import { CpGrantModule } from '../cp-grant/cp-grant.module';

@Module({
  imports: [CpGrantModule],
  providers: [AddCpService],
  exports: [AddCpService],
})
export class AddCpModule {}

