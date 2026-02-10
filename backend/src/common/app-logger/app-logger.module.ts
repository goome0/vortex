import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { AppLogger } from './app-logger';

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const getLogLevel = () => {
          const logLevel = configService.get<string>('LOG_LEVEL');
          if (logLevel) {
            return logLevel;
          }

          const isLambda = configService.get<string>('AWS_LAMBDA_FUNCTION_NAME');
          if (isLambda) {
            return 'info';
          }

          return 'info';
        };

        const serviceName = configService.get<string>('SERVICE_NAME');
        const isLambda = configService.get<string>('AWS_LAMBDA_FUNCTION_NAME');

        return {
          pinoHttp: {
            name: serviceName,
            level: getLogLevel(),
            transport: isLambda
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                    singleLine: false,
                  },
                },
            formatters: {
              level: (label) => {
                return { level: label };
              },
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class AppLoggerModule {}
