import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import request from 'supertest';
import { bootstrapE2EApp, clearDatabase, createTestAdmin, signInAndGetTokens, TEST_PASSWORD } from './auth.e2e-utils';

describe('GET /auth/profile (e2e)', () => {
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

  it('should return current user profile', async () => {
    const admin = await createTestAdmin(connection, { email: 'profile@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('email', admin.email);
    expect(response.body.data).toHaveProperty('firstName');
    expect(response.body.data).toHaveProperty('lastName');
    expect(response.body.data).not.toHaveProperty('password');
  });

  it('should return 401 without authentication', async () => {
    await request(app.getHttpServer()).get('/auth/profile').expect(401);
  });

  it('should return 401 with invalid token', async () => {
    await request(app.getHttpServer()).get('/auth/profile').set('Authorization', 'Bearer invalid-token').expect(401);
  });
});
