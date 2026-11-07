import { Request, Response, NextFunction } from 'express';

export class ErrorHandlerMiddleware {
  public static handle(err: Error, req: Request, res: Response, _next: NextFunction): void {
    console.error(`[Error] ${req.method} ${req.url} - ${err.message}`, err.stack);

    const message = err.message || 'Ha ocurrido un error inesperado en el servidor.';
    const statusCode = res.statusCode !== 200 ? res.statusCode : 400;

    res.status(statusCode).json({
      success: false,
      message
    });
  }
}
