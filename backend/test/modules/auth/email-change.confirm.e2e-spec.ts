import { EVerificationCodeType } from '@lbss9/vortex-packages';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import request from 'supertest';
import {
  bootstrapE2EApp,
  clearDatabase,
  createTestAdmin,
  createVerificationCode,
  signInAndGetTokens,
  TEST_PASSWORD,
} from './auth.e2e-utils';

describe('POST /auth/email-change/confirm (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const boot = await bootstrapE2EApp();
    app = boot.app;
    connection = boot.connection;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase(connection);
  });

  it('should confirm email change with valid code', async () => {
    const admin = await createTestAdmin(connection, { email: 'confirm@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    const newEmail = 'confirmed@example.com';
    const code = '123456';

    await createVerificationCode(connection, {
      userId: admin._id.toString(),
      type: EVerificationCodeType.EMAIL_CHANGE,
      targetValue: newEmail,
      code,
    });

    await request(app.getHttpServer())
      .post('/auth/email-change/confirm')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code })
      .expect(201);
  });

  it('should return error with invalid code', async () => {
    const admin = await createTestAdmin(connection, { email: 'invalidcode@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    await request(app.getHttpServer())
      .post('/auth/email-change/confirm')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code: '999999' })
      .expect(400);
  });

  it('should return 400 when code is missing', async () => {
    const admin = await createTestAdmin(connection, { email: 'missingcode@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    await request(app.getHttpServer())
      .post('/auth/email-change/confirm')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);
  });

  it('should return 401 without authentication', async () => {
    await request(app.getHttpServer()).post('/auth/email-change/confirm').send({ code: '123456' }).expect(401);
  });
});
