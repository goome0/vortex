import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { COMP_HACK_ENTITIES } from './entities/comp_hack';
import { WORLD_ENTITIES } from './entities/world';

@Module({
  imports: [TypeOrmModule.forFeature([...COMP_HACK_ENTITIES, ...WORLD_ENTITIES])],
  exports: [TypeOrmModule],
})
export class DatabaseEntitiesModule {}

