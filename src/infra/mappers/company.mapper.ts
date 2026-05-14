import { Company as CompanyEntity } from "../../domain/company";
import { Prisma, type Company } from "../../generated/prisma/client";

export class CompanyMapper {
  static toPersistence(company: CompanyEntity): Prisma.CompanyUncheckedCreateInput {
    return {
      id: company.id,
      phoneNumber: company.phoneNumber,
      name: company.name,
      website: company.website,
      tier: company.tier,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
  }

  static toDomain(raw: Company): CompanyEntity {
    return CompanyEntity.fromPersistence({
      id: raw.id,
      phoneNumber: raw.phoneNumber,
      name: raw.name,
      website: raw.website ?? null,
      tier: raw.tier,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    });
  }
}
