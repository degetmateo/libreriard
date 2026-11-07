import { Request, Response, NextFunction } from 'express';
import { JwtTokenProvider, TokenPayload } from '../../infrastructure/security/jwt-token-provider';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export class AuthMiddleware {
  constructor(private readonly tokenProvider: JwtTokenProvider) {}

  public authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Debe proporcionar un token de autenticación válido.'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.tokenProvider.verifyAccessToken(token);
      req.user = payload;
      next();
    } catch {
      res.status(401).json({
        success: false,
        message: 'Token de acceso inválido o expirado.'
      });
    }
  };
}

