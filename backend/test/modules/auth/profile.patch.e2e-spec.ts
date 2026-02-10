import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import request from 'supertest';
import { bootstrapE2EApp, clearDatabase, createTestAdmin, signInAndGetTokens, TEST_PASSWORD } from './auth.e2e-utils';

describe('PATCH /auth/profile (e2e)', () => {
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

  it('should update profile successfully', async () => {
    const admin = await createTestAdmin(connection, { email: 'update@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    const updateData = { firstName: 'UpdatedFirstName', lastName: 'UpdatedLastName' };

    const response = await request(app.getHttpServer())
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('firstName', updateData.firstName);
    expect(response.body.data).toHaveProperty('lastName', updateData.lastName);
  });

  it('should update profile with metadata', async () => {
    const admin = await createTestAdmin(connection, { email: 'metadata@example.com' });
    const { accessToken } = await signInAndGetTokens(app, admin.email, TEST_PASSWORD);

    const updateData = {
      metadata: {
        department: 'Engineering',
        notes: 'Test notes',
      },
    };

    const response = await request(app.getHttpServer())
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('metadata');
    expect(response.body.data.metadata).toHaveProperty('department', updateData.metadata.department);
    expect(response.body.data.metadata).toHaveProperty('notes', updateData.metadata.notes);
  });

  it('should return 401 without authentication', async () => {
    await request(app.getHttpServer()).patch('/auth/profile').send({ firstName: 'Test' }).expect(401);
  });
});
