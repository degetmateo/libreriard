import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

export class EnvConfig {
  public static readonly NODE_ENV = process.env.NODE_ENV || 'development';
  public static readonly PORT = parseInt(process.env.PORT || '5000', 10);
  public static readonly API_URL = process.env.API_URL || 'http://localhost:5000';
  public static readonly STAFF_URL = process.env.STAFF_URL || 'http://localhost:5001';
  public static readonly CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5002';

  public static readonly MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/libreriard';
  public static readonly MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'libreriard';

  public static readonly JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_key_123456';
  public static readonly JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  public static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_key_123456';
  public static readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  public static readonly COOKIE_SECRET = process.env.COOKIE_SECRET || 'dev_cookie_secret_key_123456';

  public static readonly RESEND_API_KEY = process.env.RESEND_API_KEY || '';
  public static readonly EMAIL_FROM = process.env.EMAIL_FROM || 'Librería Rubén Darío <no-reply@libreriard.com.ar>';
  public static readonly ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@libreriard.com.ar';

  public static readonly CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
  public static readonly CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
  public static readonly CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

  public static readonly INITIAL_ADMIN_NAME = process.env.INITIAL_ADMIN_NAME || 'Administrador Rubén Darío';
  public static readonly INITIAL_ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || 'admin@libreriard.com.ar';
  public static readonly INITIAL_ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || 'RubenDarioAdmin2026!';
}
