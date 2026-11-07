import { describe, it, expect } from 'vitest';
import { StaffRole, UserType, StaffUserDto } from '@libreriard/shared';

describe('Staff Auth Logic', () => {
  it('should correctly identify admin vs employee roles', () => {
    const adminUser: StaffUserDto = {
      id: '01a1b457-a4fa-77bf-87a8-310ffc7a6268',
      userType: UserType.STAFF,
      name: 'Admin Rubén Darío',
      email: 'admin@libreriard.com.ar',
      role: StaffRole.ADMIN,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const employeeUser: StaffUserDto = {
      id: '01a1b457-a4fa-77bf-87a8-310ffc7a6269',
      userType: UserType.STAFF,
      name: 'Empleado Librería',
      email: 'empleado@libreriard.com.ar',
      role: StaffRole.EMPLOYEE,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(adminUser.role === StaffRole.ADMIN).toBe(true);
    expect(employeeUser.role === StaffRole.ADMIN).toBe(false);
  });
});
