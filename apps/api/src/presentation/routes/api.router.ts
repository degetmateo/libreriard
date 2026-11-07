import { Router } from 'express';
import { MongoStaffUserRepository } from '../../infrastructure/database/repositories/mongo-staff-user.repository';
import { MongoCustomerUserRepository } from '../../infrastructure/database/repositories/mongo-customer-user.repository';
import { MongoProductRepository } from '../../infrastructure/database/repositories/mongo-product.repository';
import { MongoOrderRepository } from '../../infrastructure/database/repositories/mongo-order.repository';
import { MongoAuditLogRepository } from '../../infrastructure/database/repositories/mongo-audit-log.repository';
import { MongoSystemSettingsRepository } from '../../infrastructure/database/repositories/mongo-system-settings.repository';
import { BcryptPasswordHasher } from '../../infrastructure/security/bcrypt-password-hasher';
import { JwtTokenProvider } from '../../infrastructure/security/jwt-token-provider';
import { ResendEmailService } from '../../infrastructure/email/resend-email-service';
import { CloudinaryStorageService } from '../../infrastructure/storage/cloudinary-storage-service';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuthStaffService } from '../../application/services/auth-staff.service';
import { AuthCustomerService } from '../../application/services/auth-customer.service';
import { TokenService } from '../../application/services/token.service';
import { StaffManagementService } from '../../application/services/staff-management.service';
import { CustomerManagementService } from '../../application/services/customer-management.service';
import { ProductService } from '../../application/services/product.service';
import { OrderService } from '../../application/services/order.service';
import { SystemSettingsService } from '../../application/services/system-settings.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { StaffAuthController } from '../controllers/staff-auth.controller';
import { CustomerAuthController } from '../controllers/customer-auth.controller';
import { StaffController } from '../controllers/staff.controller';
import { CustomerController } from '../controllers/customer.controller';
import { ProductController } from '../controllers/product.controller';
import { OrderController } from '../controllers/order.controller';
import { AuditLogController } from '../controllers/audit-log.controller';
import { SettingsController } from '../controllers/settings.controller';
import { UploadController } from '../controllers/upload.controller';
import { StaffAuthRoutes } from './staff-auth.routes';
import { CustomerAuthRoutes } from './customer-auth.routes';
import { StaffRoutes } from './staff.routes';
import { CustomerRoutes } from './customer.routes';
import { ProductRoutes } from './product.routes';
import { OrderRoutes } from './order.routes';
import { AuditLogRoutes } from './audit-log.routes';
import { SettingsRoutes } from './settings.routes';
import { UploadRoutes } from './upload.routes';

export class ApiRouter {
  public static create(): Router {
    const router = Router();

    // Repositories
    const staffRepo = new MongoStaffUserRepository();
    const customerRepo = new MongoCustomerUserRepository();
    const productRepo = new MongoProductRepository();
    const orderRepo = new MongoOrderRepository();
    const auditLogRepo = new MongoAuditLogRepository();
    const settingsRepo = new MongoSystemSettingsRepository();

    // Infrastructure services
    const passwordHasher = new BcryptPasswordHasher();
    const tokenProvider = new JwtTokenProvider();
    const emailService = new ResendEmailService();
    const storageService = new CloudinaryStorageService();
    const authMiddleware = new AuthMiddleware(tokenProvider);

    // Application services
    const auditLogService = new AuditLogService(auditLogRepo);
    const authStaffService = new AuthStaffService(staffRepo, passwordHasher, tokenProvider);
    const authCustomerService = new AuthCustomerService(customerRepo, passwordHasher, tokenProvider, emailService);
    const tokenService = new TokenService(tokenProvider, staffRepo, customerRepo);
    const staffService = new StaffManagementService(staffRepo, passwordHasher);
    const customerService = new CustomerManagementService(customerRepo, emailService, passwordHasher);
    const productService = new ProductService(productRepo);
    const orderService = new OrderService(orderRepo, productRepo, customerRepo, settingsRepo, emailService);
    const settingsService = new SystemSettingsService(settingsRepo);

    // Controllers
    const staffAuthController = new StaffAuthController(authStaffService, tokenService, auditLogService, staffRepo);
    const customerAuthController = new CustomerAuthController(authCustomerService, tokenService, auditLogService);
    const staffController = new StaffController(staffService, auditLogService);
    const customerController = new CustomerController(customerService, auditLogService);
    const productController = new ProductController(productService, auditLogService);
    const orderController = new OrderController(orderService, auditLogService);
    const auditLogController = new AuditLogController(auditLogService);
    const settingsController = new SettingsController(settingsService, auditLogService);
    const uploadController = new UploadController(storageService);

    // Routes mounting
    router.use('/auth/staff', StaffAuthRoutes.create(staffAuthController, authMiddleware));
    router.use('/auth/customer', CustomerAuthRoutes.create(customerAuthController));
    router.use('/staff', StaffRoutes.create(staffController, authMiddleware));
    router.use('/customers', CustomerRoutes.create(customerController, authMiddleware));
    router.use('/products', ProductRoutes.create(productController, authMiddleware));
    router.use('/orders', OrderRoutes.create(orderController, authMiddleware));
    router.use('/audit-logs', AuditLogRoutes.create(auditLogController, authMiddleware));
    router.use('/settings', SettingsRoutes.create(settingsController, authMiddleware));
    router.use('/upload', UploadRoutes.create(uploadController, authMiddleware));

    return router;
  }
}

