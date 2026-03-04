import { PrismaClient } from '@prisma/client';
import { ICompanyRepository } from '../../domain/interfaces/repositories/ICompanyRepository';
import { Company, Plan } from '../../domain/entities/Company';

export class PrismaCompanyRepository implements ICompanyRepository {
  constructor(private prisma: PrismaClient) {}

  public async create(company: Company): Promise<Company> {
    const createdCompany = await this.prisma.company.create({
      data: {
        id: company.id,
        name: company.name,
        phone: company.phone,
        plan: company.plan as any,
      },
    });

    return Company.create({
      ...createdCompany,
      plan: createdCompany.plan as Plan,
    });
  }

  public async findById(id: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) return null;

    return Company.create({
      ...company,
      plan: company.plan as Plan,
    });
  }

  public async findByPhone(phone: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: { phone },
    });

    if (!company) return null;

    return Company.create({
      ...company,
      plan: company.plan as Plan,
    });
  }

  public async update(company: Company): Promise<Company> {
    const updatedCompany = await this.prisma.company.update({
      where: { id: company.id },
      data: {
        name: company.name,
        phone: company.phone,
        plan: company.plan as any,
      },
    });

    return Company.create({
      ...updatedCompany,
      plan: updatedCompany.plan as Plan,
    });
  }
}
