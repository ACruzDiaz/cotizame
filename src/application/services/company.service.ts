import { prisma } from "../connection/prismaClient";
import type {
  Prisma,
  Company,
  CompanySecret,
  CompanyTier,
} from "../../generated/prisma/client";

//Create types for custom payload response from DB
type CompanyCreatePayload = Prisma.CompanySecretGetPayload<{
  select: {
    companyId: true;
  };
}>;

class CompanyService {
  constructor() {}

  public async create(phoneNumber: string, name: string): Promise<Company> {
    try {
      //TODO. Check company phone number does not exist
      return await prisma.company.create({
        data: {
          phoneNumber,
          name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to create a company. Details: ${error}`);
    }
  }

  public async assignSecret(
    companyId: string,
    whatsappTokenHash: string,
    phoneNumberId: string
  ): Promise<CompanyCreatePayload> {
    try {
      return await prisma.companySecret.upsert({
        where: { companyId },
        update: {
          whatsappTokenHash,
          phoneNumberId,
        },
        create: {
          companyId,
          whatsappTokenHash,
          phoneNumberId,
        },
        select: {
          companyId: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to assign secret. Details: ${error}`);
    }
  }

  public async getByPhoneNumber(phoneNumber: string): Promise<Company | null> {
    try {
      return await prisma.company.findUnique({
        where: { phoneNumber },
      });
    } catch (error) {
      throw new Error(
        `Failed to get company by phone number. Details: ${error}`
      );
    }
  }

  public async getById(id: string): Promise<Company | null> {
    try {
      return await prisma.company.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to get company by id. Details: ${error}`);
    }
  }

  public async updateTier(id: string, tier: CompanyTier): Promise<Company> {
    try {
      return await prisma.company.update({
        where: { id },
        data: {
          tier,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to update company tier. Details: ${error}`);
    }
  }
}
