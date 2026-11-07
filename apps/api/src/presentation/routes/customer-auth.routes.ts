import { Router } from 'express';
import { CustomerAuthController } from '../controllers/customer-auth.controller';
import { ValidateMiddleware } from '../middlewares/validate.middleware';
import { customerRegisterSchema, loginSchema, tokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema';

export class CustomerAuthRoutes {
  public static create(controller: CustomerAuthController): Router {
    const router = Router();
    router.post('/register', ValidateMiddleware.validate(customerRegisterSchema), controller.register);
    router.post('/activate', ValidateMiddleware.validate(tokenSchema), controller.activate);
    router.post('/login', ValidateMiddleware.validate(loginSchema), controller.login);
    router.post('/forgot-password', ValidateMiddleware.validate(forgotPasswordSchema), controller.forgotPassword);
    router.post('/reset-password', ValidateMiddleware.validate(resetPasswordSchema), controller.resetPassword);
    router.post('/refresh', controller.refresh);
    router.post('/logout', controller.logout);
    return router;
  }
}

