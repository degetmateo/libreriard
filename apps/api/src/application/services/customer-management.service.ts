import { ICustomerUserRepository, CustomerFilterParams } from '../../domain/repositories/customer-user.repository.interface';
import { IEmailService } from '../../infrastructure/email/email-service.interface';
import { IPasswordHasher } from '../../infrastructure/security/password-hasher.interface';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';
import { CustomerUserMapper } from '../../infrastructure/database/mappers/customer-user.mapper';
import { CustomerUserDto, AdminUpdateCustomerDto } from '@libreriard/shared';

export class CustomerManagementService {
  constructor(
    private readonly customerRepo: ICustomerUserRepository,
    private readonly emailService: IEmailService,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  public async getCustomers(params: CustomerFilterParams): Promise<{ items: CustomerUserDto[]; total: number }> {
    const result = await this.customerRepo.findMany(params);
    return { items: result.items.map(c => CustomerUserMapper.toDto(c)), total: result.total };
  }

  public async getCustomerById(idStr: string): Promise<CustomerUserDto> {
    const customer = await this.customerRepo.findById(UUIDv7.fromString(idStr));
    if (!customer) throw new Error('Cliente no encontrado.');
    return CustomerUserMapper.toDto(customer);
  }

  public async adminUpdateCustomer(idStr: string, dto: AdminUpdateCustomerDto): Promise<CustomerUserDto> {
    const customer = await this.customerRepo.findById(UUIDv7.fromString(idStr));
    if (!customer) throw new Error('Cliente no encontrado.');
    customer.adminUpdateDetails(dto);
    await this.customerRepo.save(customer);
    return CustomerUserMapper.toDto(customer);
  }

  public async adminResetPassword(idStr: string, newPass: string): Promise<void> {
    const customer = await this.customerRepo.findById(UUIDv7.fromString(idStr));
    if (!customer) throw new Error('Cliente no encontrado.');
    const hash = await this.passwordHasher.hash(newPass);
    customer.updatePassword(hash);
    await this.customerRepo.save(customer);
  }

  public async toggleCustomerActive(idStr: string): Promise<CustomerUserDto> {
    const customer = await this.customerRepo.findById(UUIDv7.fromString(idStr));
    if (!customer) throw new Error('Cliente no encontrado.');
    customer.toggleActive();
    await this.customerRepo.save(customer);
    return CustomerUserMapper.toDto(customer);
  }

  public async requestWholesale(customerIdStr: string, message?: string): Promise<void> {
    const customer = await this.customerRepo.findById(UUIDv7.fromString(customerIdStr));
    if (!customer) throw new Error('Cliente no encontrado.');
    customer.requestWholesale(message);
    await this.customerRepo.save(customer);
    await this.emailService.sendWholesaleRequestNotification(customer.name, customer.email.toValue(), customer.cuitCuil, message);
  }

  public async reviewWholesale(customerIdStr: string, approved: boolean): Promise<CustomerUserDto> {
    const customer = await this.customerRepo.findById(UUIDv7.fromString(customerIdStr));
    if (!customer) throw new Error('Cliente no encontrado.');
    customer.reviewWholesale(approved);
    await this.customerRepo.save(customer);
    return CustomerUserMapper.toDto(customer);
  }
}
