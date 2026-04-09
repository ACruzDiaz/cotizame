import { prisma } from "../connection/prismaClient";
import type { Prisma, CompanySecret } from "../../generated/prisma/client";

export class CompanySecretService {
  constructor() {}

  public async create(
    data: Prisma.CompanySecretUncheckedCreateInput,
  ): Promise<{ companyId: string }> {
    try {
      return await prisma.companySecret.create({
        data,
        select: {
          companyId: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create a CompanySecret. Details: ${error}`);
    }
  }

  public async remove(companyId: string): Promise<{ companyId: string }> {
    try {
      return await prisma.companySecret.delete({
        where: { companyId },
        select: {
          companyId: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete companySecret. details ${error}`);
    }
  }

  public async update(
    companyId: string,
    data: Prisma.CompanySecretUpdateInput,
  ): Promise<{ companyId: string }> {
    try {
      return await prisma.companySecret.update({
        where: { companyId },
        data,
        select: {
          companyId: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update companySecret. details ${error}`);
    }
  }

  public async getByProperty(
    where: Prisma.CompanySecretWhereInput,
  ): Promise<CompanySecret[]> {
    try {
      return await prisma.companySecret.findMany({
        where,
      });
    } catch (error) {
      throw new Error(
        `Failed to get companySecrets by property. details ${error}`,
      );
    }
  }

  public async getById(companyId: string): Promise<CompanySecret | null> {
    try {
      return await prisma.companySecret.findUnique({
        where: { companyId },
      });
    } catch (error) {
      throw new Error(
        `Failed to get companySecret by companyId. details ${error}`,
      );
    }
  }
}
