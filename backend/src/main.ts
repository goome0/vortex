import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Basic hardening for an API server.
  app.use(
    helmet({
      // API-only: disable CSP headers (handled by the Tauri/WebView side if needed).
      contentSecurityPolicy: false,
    }),
  );
  (app as any).disable?.('x-powered-by');
  
  // Enable CORS for frontend
  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser tools (no Origin header)
      if (!origin) return callback(null, true);
      // Some WebViews (and file-like contexts) send `Origin: null`
      if (origin === 'null') return callback(null, true);

      const allowList = new Set([
        'http://localhost:1420',
        'http://127.0.0.1:1420',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        // Tauri WebView origins (dev/prod)
        'tauri://localhost',
        'http://tauri.localhost',
        'https://tauri.localhost',
        'app://localhost',
      ]);

      if (allowList.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT || 3000);
}

void bootstrap();
