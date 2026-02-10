import { EAdminStatus } from '@lbss9/zap-food-packages';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import request from 'supertest';
import { bootstrapE2EApp, clearDatabase, createTestAdmin, TEST_PASSWORD } from './auth.e2e-utils';

describe('POST /auth/sign-in (e2e)', () => {
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

  it('should authenticate with valid credentials', async () => {
    const admin = await createTestAdmin(connection, { email: 'test@example.com' });

    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: admin.email, password: TEST_PASSWORD })
      .expect(201);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('refreshToken');
  });

  it('should return 401 with invalid password', async () => {
    const admin = await createTestAdmin(connection, { email: 'test@example.com' });

    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: admin.email, password: 'WrongP@ssw0rd123' })
      .expect(401);
  });

  it('should return 404 with non-existent email', async () => {
    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'nonexistent@example.com', password: TEST_PASSWORD })
      .expect(404);
  });

  it('should return 400 with invalid email format', async () => {
    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'invalid-email', password: TEST_PASSWORD })
      .expect(400);
  });

  it('should return 403 when admin is inactive', async () => {
    const admin = await createTestAdmin(connection, {
      email: 'inactive@example.com',
      status: EAdminStatus.INACTIVE,
    });

    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: admin.email, password: TEST_PASSWORD })
      .expect(403);
  });

  it('should return 403 when admin is blocked', async () => {
    const admin = await createTestAdmin(connection, {
      email: 'blocked@example.com',
      status: EAdminStatus.BLOCKED,
    });

    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: admin.email, password: TEST_PASSWORD })
      .expect(403);
  });
});
