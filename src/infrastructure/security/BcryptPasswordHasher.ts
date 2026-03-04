import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../domain/interfaces/services/IPasswordHasher';

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly rounds = 10;

  public async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.rounds);
  }

  public async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
