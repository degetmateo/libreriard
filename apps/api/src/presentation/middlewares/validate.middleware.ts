import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export class ValidateMiddleware {
  public static validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (err) {
        if (err instanceof ZodError) {
          const errors: Record<string, string[]> = {};
          for (const issue of err.issues) {
            const key = issue.path.join('.') || 'body';
            if (!errors[key]) errors[key] = [];
            errors[key].push(issue.message);
          }
          res.status(422).json({
            success: false,
            message: 'Datos de entrada inválidos. Por favor verifique el formulario.',
            errors
          });
          return;
        }
        next(err);
      }
    };
  }
}
