import { IClientRepository } from '../../../domain/interfaces/repositories/IClientRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IPasswordHasher } from '../../../domain/interfaces/services/IPasswordHasher';
import { User, Role } from '../../../domain/entities/User';

export interface RegisterClientUserInput {
  companyId: string;
  phone: string;
  email: string;
  password: string;
  name?: string;
}

export class RegisterClientUser {
  constructor(
    private clientRepository: IClientRepository,
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
  ) {}

  public async execute(input: RegisterClientUserInput): Promise<void> {
    const client = await this.clientRepository.findByPhone(input.companyId, input.phone);
    if (!client) {
      throw new Error('No client found with this phone number for this company');
    }

    if (client.userId) {
      throw new Error('Client is already registered');
    }

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = User.create({
      companyId: input.companyId,
      name: input.name || client.name || 'Client', // Fallback to provided name, client name or 'Client'
      email: input.email,
      passwordHash,
      role: Role.CLIENT,
    });

    const createdUser = await this.userRepository.create(user);

    client.register(createdUser.id!);
    await this.clientRepository.update(client);
  }
}
