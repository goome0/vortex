import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import request from 'supertest';
import { bootstrapE2EApp, clearDatabase, createTestAdmin, signInAndGetTokens, TEST_PASSWORD } from './auth.e2e-utils';

describe('POST /auth/refresh-token (e2e)', () => {
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

  it('should refresh tokens with valid refresh token', async () => {
    const admin = await createTestAdmin(connection, { email: 'refresh@example.com' });
    const { refreshToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    const response = await request(app.getHttpServer()).post('/auth/refresh-token').send({ refreshToken }).expect(201);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('refreshToken');
  });

  it('should return 401 with invalid refresh token', async () => {
    await request(app.getHttpServer()).post('/auth/refresh-token').send({ refreshToken: 'invalid-token' }).expect(401);
  });

  it('should return 400 when refresh token is missing', async () => {
    await request(app.getHttpServer()).post('/auth/refresh-token').send({}).expect(400);
  });
});
