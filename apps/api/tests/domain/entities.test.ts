import { describe, it, expect } from 'vitest';
import { StaffUserFactory } from '../../src/domain/factories/staff-user.factory';
import { CustomerUserFactory } from '../../src/domain/factories/customer-user.factory';
import { ProductFactory } from '../../src/domain/factories/product.factory';
import { StaffRole, CustomerWholesaleStatus } from '@libreriard/shared';

describe('Domain Entities & Factories', () => {
  it('should create StaffUser with role and verify admin privileges', () => {
    const admin = StaffUserFactory.create({
      name: 'Ruben Dario',
      email: 'admin@libreriard.com.ar',
      passwordHash: 'hashed_pw',
      role: StaffRole.ADMIN
    });

    expect(admin.isAdmin()).toBe(true);
    expect(admin.isActive).toBe(true);
  });

  it('should create CustomerUser in unverified state and handle verification', () => {
    const customer = CustomerUserFactory.create({
      name: 'Empresa Test',
      cuitCuil: '30-71112223-4',
      email: 'contacto@empresa.com',
      passwordHash: 'hashed_pw'
    });

    expect(customer.isEmailVerified).toBe(false);
    expect(customer.isWholesaleApproved).toBe(false);
    expect(customer.verificationToken).toBeDefined();

    customer.verifyEmail();
    expect(customer.isEmailVerified).toBe(true);
    expect(customer.verificationToken).toBeUndefined();
  });

  it('should handle wholesale workflow for customer', () => {
    const customer = CustomerUserFactory.create({
      name: 'Libreria Aliada',
      cuitCuil: '30-99887766-5',
      email: 'compras@aliada.com',
      passwordHash: 'hashed_pw'
    });

    customer.requestWholesale('Deseo comprar por mayor');
    expect(customer.wholesaleStatus).toBe(CustomerWholesaleStatus.PENDING);
    expect(customer.wholesaleMessage).toBe('Deseo comprar por mayor');

    customer.reviewWholesale(true);
    expect(customer.isWholesaleApproved).toBe(true);
    expect(customer.wholesaleStatus).toBe(CustomerWholesaleStatus.APPROVED);
  });

  it('should create Product and handle variant and price details', () => {
    const product = ProductFactory.create({
      name: 'Cuaderno A4 Universitario',
      description: 'Cuaderno rayado 100 hojas tapa dura',
      barcode: '7791234567890',
      retailPrice: 4500,
      wholesalePrice: 3200,
      supplier: 'Rivadavia',
      categories: ['Escolar', 'Cuadernos'],
      tags: ['cuaderno', 'rayado', 'a4']
    });

    expect(product.retailPrice.getAmount()).toBe(4500);
    expect(product.wholesalePrice.getAmount()).toBe(3200);
    expect(product.barcode).toBe('7791234567890');
  });
});
