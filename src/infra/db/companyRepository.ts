import { prisma } from "../../application/connection/prismaClient";
import { CompanyMapper } from "../mappers/company.mapper";
import { Company as CompanyEntity } from "../../domain/company";
import type { CompanyRepository } from "../../domain/repository/companyRepository";

export class PrismaCompanyRepository implements CompanyRepository {
  async save(entity: CompanyEntity): Promise<CompanyEntity> {
    const raw = await prisma.company.create({
      data: CompanyMapper.toPersistence(entity),
    });
    return CompanyMapper.toDomain(raw);
  }

  async update(id: string, entity: CompanyEntity): Promise<CompanyEntity> {
    const data = CompanyMapper.toPersistence(entity) as any;
    delete data.id;
    const raw = await prisma.company.update({ where: { id }, data });
    return CompanyMapper.toDomain(raw);
  }

  async findByID(id: string): Promise<CompanyEntity | null> {
    const raw = await prisma.company.findUnique({ where: { id } });
    if (!raw) return null;
    return CompanyMapper.toDomain(raw);
  }
  async findByPhone(phone: string): Promise<CompanyEntity | null> {
    const raw = await prisma.company.findUnique({
      where: { phoneNumber: phone },
    });
    if (!raw) return null;
    return CompanyMapper.toDomain(raw);
  }

  async getAll(): Promise<CompanyEntity[]> {
    const raws = await prisma.company.findMany();
    return raws.map(CompanyMapper.toDomain);
  }

  async remove(id: string): Promise<void> {
    await prisma.company.delete({ where: { id } });
  }
}
