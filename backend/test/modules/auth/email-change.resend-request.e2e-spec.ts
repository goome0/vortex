import { EVerificationCodeType } from '@lbss9/zap-food-packages';
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

describe('POST /auth/email-change/resend-request (e2e)', () => {
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

  it('should resend email change verification code', async () => {
    const admin = await createTestAdmin(connection, { email: 'resend@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    const newEmail = 'newresend@example.com';

    await createVerificationCode(connection, {
      userId: admin._id.toString(),
      type: EVerificationCodeType.EMAIL_CHANGE,
      targetValue: newEmail,
    });

    await request(app.getHttpServer())
      .post('/auth/email-change/resend-request')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: newEmail })
      .expect(201);
  });

  it('should return 400 with invalid email format', async () => {
    const admin = await createTestAdmin(connection, { email: 'test@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    await request(app.getHttpServer())
      .post('/auth/email-change/resend-request')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'invalid-email' })
      .expect(400);
  });

  it('should return 401 without authentication', async () => {
    await request(app.getHttpServer())
      .post('/auth/email-change/resend-request')
      .send({ email: 'new@example.com' })
      .expect(401);
  });
});
