import { AppModule } from '@/app.module';
import {
  AdminSeeder,
  EAdminRole,
  EAdminStatus,
  EVerificationCodeStatus,
  EVerificationCodeType,
  PublishQueueMessageService,
  VerificationCodesSeeder,
} from '@lbss9/vortex-packages';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { Connection } from 'mongoose';
import request from 'supertest';

export const TEST_PASSWORD = 'P@ssw0rd123';

const publishQueueMessageServiceMock: Pick<PublishQueueMessageService, 'execute'> = {
  // avoid AWS SQS calls in e2e
  execute: async () => ({
    messageId: 'test-message-id',
    sequenceNumber: '1',
  }),
};

export async function bootstrapE2EApp(): Promise<{
  app: INestApplication;
  connection: Connection;
}> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PublishQueueMessageService)
    .useValue(publishQueueMessageServiceMock)
    .compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  const connection = module.get<Connection>(getConnectionToken());

  return { app, connection };
}

export async function clearDatabase(connection: Connection): Promise<void> {
  const collections = connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

export async function createTestAdmin(
  connection: Connection,
  overrides: Record<string, any> = {},
  password: string = TEST_PASSWORD,
): Promise<any> {
  const adminData = AdminSeeder.createOne().data;
  const hashedPassword = await argon2.hash(password);

  const admin = {
    ...adminData,
    email: overrides.email || adminData.email,
    password: hashedPassword,
    phone: overrides.phone || adminData.phone || '+5511999999999',
    role: overrides.role || EAdminRole.MANAGER,
    status: overrides.status || EAdminStatus.ACTIVE,
    ...overrides,
  };

  const result = await connection.collection('admins').insertOne(admin);
  return { ...admin, id: result.insertedId.toString(), _id: result.insertedId };
}

export async function createVerificationCode(
  connection: Connection,
  {
    userId,
    type,
    targetValue,
    code = '123456',
  }: {
    userId: string;
    type: EVerificationCodeType;
    targetValue: string;
    code?: string;
  },
): Promise<any> {
  const verificationData = VerificationCodesSeeder.createOne().data;

  const verification = {
    ...verificationData,
    userId,
    type,
    targetValue,
    code,
    status: EVerificationCodeStatus.PENDING,
    sentTo: targetValue,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  };

  const result = await connection.collection('verification_codes').insertOne(verification);

  return {
    ...verification,
    id: result.insertedId.toString(),
    _id: result.insertedId,
  };
}

export async function signInAndGetTokens(
  app: INestApplication,
  email: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await request(app.getHttpServer()).post('/auth/sign-in').send({ email, password });

  return {
    accessToken: response.body?.data?.token,
    refreshToken: response.body?.data?.refreshToken,
  };
}
