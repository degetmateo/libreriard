import { IStaffUserRepository } from '../../domain/repositories/staff-user.repository.interface';
import { IPasswordHasher } from '../../infrastructure/security/password-hasher.interface';
import { StaffUserFactory } from '../../domain/factories/staff-user.factory';
import { Email } from '../../domain/value-objects/email.vo';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';
import { StaffUserMapper } from '../../infrastructure/database/mappers/staff-user.mapper';
import { CreateStaffDto, UpdateStaffDto, StaffUserDto } from '@libreriard/shared';

export class StaffManagementService {
  constructor(
    private readonly staffRepo: IStaffUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  public async getAllStaff(): Promise<StaffUserDto[]> {
    const list = await this.staffRepo.findAll();
    return list.map(u => StaffUserMapper.toDto(u));
  }

  public async createStaff(dto: CreateStaffDto): Promise<StaffUserDto> {
    const email = Email.create(dto.email);
    const existing = await this.staffRepo.findByEmail(email);
    if (existing) {
      throw new Error('Ya existe un usuario de staff con este correo electrónico.');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const staff = StaffUserFactory.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role
    });

    await this.staffRepo.save(staff);
    return StaffUserMapper.toDto(staff);
  }

  public async updateStaff(idStr: string, dto: UpdateStaffDto): Promise<StaffUserDto> {
    const staff = await this.staffRepo.findById(UUIDv7.fromString(idStr));
    if (!staff) throw new Error('Miembro del staff no encontrado.');

    staff.updateProfile(dto.name, dto.role, dto.isActive);
    await this.staffRepo.save(staff);
    return StaffUserMapper.toDto(staff);
  }

  public async resetPassword(idStr: string, newPass: string): Promise<void> {
    const staff = await this.staffRepo.findById(UUIDv7.fromString(idStr));
    if (!staff) throw new Error('Miembro del staff no encontrado.');

    const newHash = await this.passwordHasher.hash(newPass);
    staff.updatePassword(newHash);
    await this.staffRepo.save(staff);
  }

  public async deleteStaff(idStr: string): Promise<void> {
    const id = UUIDv7.fromString(idStr);
    const staff = await this.staffRepo.findById(id);
    if (!staff) throw new Error('Miembro del staff no encontrado.');

    await this.staffRepo.delete(id);
  }
}

