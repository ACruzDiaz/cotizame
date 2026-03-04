import { ICompanyRepository } from '../../../domain/interfaces/repositories/ICompanyRepository';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IPasswordHasher } from '../../../domain/interfaces/services/IPasswordHasher';
import { Company, Plan } from '../../../domain/entities/Company';
import { User, Role } from '../../../domain/entities/User';

export interface RegisterCompanyRequest {
  companyName: string;
  companyPhone: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface RegisterCompanyResponse {
  companyId: string;
  adminId: string;
}

export class RegisterCompany {
  constructor(
    private companyRepository: ICompanyRepository,
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
  ) {}

  public async execute(request: RegisterCompanyRequest): Promise<RegisterCompanyResponse> {
    const existingCompany = await this.companyRepository.findByPhone(request.companyPhone);
    if (existingCompany) {
      throw new Error('Company with this phone already exists');
    }

    const existingUser = await this.userRepository.findByEmail(request.adminEmail);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const company = Company.create({
      name: request.companyName,
      phone: request.companyPhone,
      plan: Plan.FREE,
    });

    const createdCompany = await this.companyRepository.create(company);

    const passwordHash = await this.passwordHasher.hash(request.adminPassword);

    const admin = User.create({
      companyId: createdCompany.id!,
      name: request.adminName,
      email: request.adminEmail,
      passwordHash: passwordHash,
      role: Role.ADMIN,
    });

    const createdAdmin = await this.userRepository.create(admin);

    return {
      companyId: createdCompany.id!,
      adminId: createdAdmin.id!,
    };
  }
}
