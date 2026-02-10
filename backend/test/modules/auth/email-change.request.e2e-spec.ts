import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import request from 'supertest';
import { bootstrapE2EApp, clearDatabase, createTestAdmin, signInAndGetTokens, TEST_PASSWORD } from './auth.e2e-utils';

describe('POST /auth/email-change/request (e2e)', () => {
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

  it('should request email change successfully', async () => {
    const admin = await createTestAdmin(connection, { email: 'emailchange@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    await request(app.getHttpServer())
      .post('/auth/email-change/request')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'newemail@example.com' })
      .expect(201);
  });

  it('should return 400 with invalid email format', async () => {
    const admin = await createTestAdmin(connection, { email: 'test@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    await request(app.getHttpServer())
      .post('/auth/email-change/request')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'invalid-email' })
      .expect(400);
  });

  it('should return 401 without authentication', async () => {
    await request(app.getHttpServer())
      .post('/auth/email-change/request')
      .send({ email: 'new@example.com' })
      .expect(401);
  });

  it('should return error when new email already exists', async () => {
    const admin = await createTestAdmin(connection, { email: 'existing@example.com' });
    const admin2 = await createTestAdmin(connection, { email: 'requesting@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin2.email, TEST_PASSWORD);

    await request(app.getHttpServer())
      .post('/auth/email-change/request')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: admin.email })
      .expect(400);
  });
});
