import bcrypt from 'bcryptjs';
import { IPasswordHasher } from './password-hasher.interface';

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly rounds: number;

  constructor(rounds: number = 10) {
    this.rounds = rounds;
  }

  public async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  public async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
