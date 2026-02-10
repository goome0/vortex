import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppLoggerModule } from './common/app-logger';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionGuard } from './common/guards/permission.guard';
import { DatabaseRepositoriesModule } from './database/database-repositories.module';
import { COMP_HACK_ENTITIES, WORLD_ENTITIES } from './database/entities';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { ServerControlModule } from './modules/server-control/server-control.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { WebGameModule } from './modules/webgame/webgame.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        entities: [...COMP_HACK_ENTITIES, ...WORLD_ENTITIES],
        autoLoadEntities: true,
        synchronize: configService.getOrThrow<string>('DB_SYNCHRONIZE') === 'true',
        logging: configService.getOrThrow<string>('DB_LOGGING') === 'true',
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        // Access token TTL (refresh token TTL is set explicitly when signing refresh tokens)
        signOptions: {
          // Cast needed because `expiresIn` typing uses `StringValue` from `ms`.
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ?? '1h') as any,
        },
        verifyOptions: {
          algorithms: ['HS256'],
        },
      }),
      inject: [ConfigService],
    }),
    AppLoggerModule,
    DatabaseRepositoriesModule,
    AuthModule,
    AdminModule,
    TicketsModule,
    ServerControlModule,
    WebGameModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        errorHttpStatusCode: 400,
        disableErrorMessages: false,
      }),
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
