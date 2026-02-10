import 'reflect-metadata';

process.env.APP_NAME = 'vortex-backend';
process.env.PORT = '3001';
process.env.STAGE = 'test';

process.env.MONGODB_URI = 'mongodb://admin:123456@localhost:27017/vortex_test?authSource=admin';

process.env.REDIS_URL = 'redis://localhost:6379';
process.env.REDIS_TTL = '3600';

process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
process.env.JWT_EXPIRES_IN = '1h';

process.env.SEND_EMAIL_QUEUE = 'https://sqs.us-west-2.amazonaws.com/212263949491/vortex-dev-send-email';

jest.setTimeout(20000);
