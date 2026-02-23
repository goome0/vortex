import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

function parseCorsAllowList(raw: string | undefined): string[] {
  const v = String(raw ?? '').trim();
  if (!v) return [];
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

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

      const allowList = new Set<string>([
        'http://localhost:1420',
        'http://127.0.0.1:1420',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        // Production web
        'https://hhw-vortex.online',
        'https://www.hhw-vortex.online',
        // Tauri WebView origins (dev/prod)
        'tauri://localhost',
        'http://tauri.localhost',
        'https://tauri.localhost',
        'app://localhost',
      ]);

      for (const extraOrigin of parseCorsAllowList(process.env.CORS_ALLOW_ORIGINS)) {
        allowList.add(extraOrigin);
      }

      if (allowList.has(origin)) return callback(null, true);

      // Do not throw (which becomes a 500); just deny CORS for this request.
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT || 3000);
}

void bootstrap();
