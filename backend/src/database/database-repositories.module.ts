import { Global, Module } from '@nestjs/common';
import { DatabaseEntitiesModule } from './database-entities.module';

/**
 * Alias module: importing this enables `@InjectRepository(Entity)` for
 * all entities across both MariaDB databases (`comp_hack` and `world`).
 */
@Module({
  imports: [DatabaseEntitiesModule],
  exports: [DatabaseEntitiesModule],
})
@Global()
export class DatabaseRepositoriesModule {}
