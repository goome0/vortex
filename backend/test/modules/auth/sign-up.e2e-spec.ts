import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import request from 'supertest';
import { bootstrapE2EApp, clearDatabase, createTestAdmin, TEST_PASSWORD } from './auth.e2e-utils';

describe('POST /auth/sign-up (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  const signUpPayload = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: TEST_PASSWORD,
    phone: '+5511999999999',
  };

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

  it('should create a new admin account', async () => {
    const response = await request(app.getHttpServer()).post('/auth/sign-up').send(signUpPayload).expect(201);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('refreshToken');
  });

  it('should return 400 when email is invalid', async () => {
    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ ...signUpPayload, email: 'invalid-email' })
      .expect(400);
  });

  it('should return 400 when password is weak', async () => {
    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ ...signUpPayload, password: '123' })
      .expect(400);
  });

  it('should return 400 when required fields are missing', async () => {
    await request(app.getHttpServer()).post('/auth/sign-up').send({ email: signUpPayload.email }).expect(400);
  });

  it('should return error when email already exists', async () => {
    await createTestAdmin(connection, { email: signUpPayload.email });

    await request(app.getHttpServer()).post('/auth/sign-up').send(signUpPayload).expect(409);
  });

  it('should allow sign-up when phone already exists', async () => {
    await createTestAdmin(connection, { phone: signUpPayload.phone });

    await request(app.getHttpServer()).post('/auth/sign-up').send(signUpPayload).expect(201);
  });
});
