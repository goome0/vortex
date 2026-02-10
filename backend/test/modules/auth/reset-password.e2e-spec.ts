import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import request from 'supertest';
import { bootstrapE2EApp, clearDatabase, createTestAdmin, signInAndGetTokens, TEST_PASSWORD } from './auth.e2e-utils';

describe('POST /auth/reset-password (e2e)', () => {
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

  it('should reset password with valid credentials', async () => {
    const admin = await createTestAdmin(connection, { email: 'resetpass@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    const newPassword = 'NewP@ssw0rd456';

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: TEST_PASSWORD, newPassword })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: admin.email, password: newPassword })
      .expect(201);
  });

  it('should return error with incorrect old password', async () => {
    const admin = await createTestAdmin(connection, { email: 'wrongold@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: 'WrongP@ssw0rd123', newPassword: 'NewP@ssw0rd456' })
      .expect(401);
  });

  it('should return 400 with weak new password', async () => {
    const admin = await createTestAdmin(connection, { email: 'weaknew@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: TEST_PASSWORD, newPassword: '123' })
      .expect(400);
  });

  it('should return 400 when passwords are missing', async () => {
    const admin = await createTestAdmin(connection, { email: 'missing@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);
  });

  it('should return 401 without authentication', async () => {
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ oldPassword: TEST_PASSWORD, newPassword: 'NewP@ssw0rd456' })
      .expect(401);
  });
});
