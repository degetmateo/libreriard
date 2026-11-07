import { MongoStaffUserRepository } from './repositories/mongo-staff-user.repository';
import { BcryptPasswordHasher } from '../security/bcrypt-password-hasher';
import { StaffUserFactory } from '../../domain/factories/staff-user.factory';
import { StaffRole } from '@libreriard/shared';
import { EnvConfig } from '../config/env.config';

export class DatabaseSeeder {
  public static async seedInitialAdmin(): Promise<void> {
    const staffRepo = new MongoStaffUserRepository();
    const count = await staffRepo.count();

    if (count === 0) {
      console.log('⚡ No staff users found. Seeding initial Super Administrator...');
      const passwordHasher = new BcryptPasswordHasher();
      const passwordHash = await passwordHasher.hash(EnvConfig.INITIAL_ADMIN_PASSWORD);

      const admin = StaffUserFactory.create({
        name: EnvConfig.INITIAL_ADMIN_NAME,
        email: EnvConfig.INITIAL_ADMIN_EMAIL,
        passwordHash,
        role: StaffRole.ADMIN
      });

      await staffRepo.save(admin);
      console.log(`✅ Super Admin created: ${admin.email.toValue()} (${admin.role})`);
    }
  }
}

