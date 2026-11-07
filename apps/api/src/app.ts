import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ApiRouter } from './presentation/routes/api.router';
import { ErrorHandlerMiddleware } from './presentation/middlewares/error-handler.middleware';
import { EnvConfig } from './infrastructure/config/env.config';

export class App {
  public readonly app: Application;

  constructor() {
    this.app = express();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddlewares(): void {
    this.app.use(helmet());

    const allowedOrigins = [
      EnvConfig.CLIENT_URL,
      EnvConfig.STAFF_URL,
      'http://localhost:5001',
      'http://localhost:5002',
      'https://libreriard.com.ar',
      'https://staff.libreriard.com.ar'
    ];

    this.app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origen no permitido por política CORS: ${origin}`));
        }
      },
      credentials: true
    }));

    this.app.use(express.json());
    this.app.use(cookieParser(EnvConfig.COOKIE_SECRET));
  }

  private configureRoutes(): void {
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    this.app.use(['/v1'], ApiRouter.create());
  }

  private configureErrorHandling(): void {
    this.app.use(ErrorHandlerMiddleware.handle);
  }
}

