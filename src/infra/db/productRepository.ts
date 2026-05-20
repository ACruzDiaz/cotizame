import { prisma } from "../../application/connection/prismaClient.js";
import { ProductMapper } from "../mappers/product.mapper.js";
import { Product as ProductEntity } from "../../domain/product.js";
import type { ProductRepository } from "../../domain/repository/productRepository.js";

export class PrismaProductRepository implements ProductRepository {
  async save(entity: ProductEntity): Promise<ProductEntity> {
    const raw = await prisma.product.create({
      data: ProductMapper.toPersistence(entity),
    });
    return ProductMapper.toDomain(raw);
  }

  async update(id: string, entity: ProductEntity): Promise<ProductEntity> {
    const data = ProductMapper.toPersistence(entity) as any;
    delete data.id;
    const raw = await prisma.product.update({ where: { id }, data });
    return ProductMapper.toDomain(raw);
  }

  async findByID(id: string): Promise<ProductEntity | null> {
    const raw = await prisma.product.findUnique({ where: { id } });
    if (!raw) return null;
    return ProductMapper.toDomain(raw);
  }

  async getAllFilterByCompany(companyId: string): Promise<ProductEntity[]> {
    const raws = await prisma.product.findMany({ where: { companyId } });
    return raws.map(ProductMapper.toDomain);
  }
  async getAllFilterByCompanyPhone(
    companyPhone: string
  ): Promise<ProductEntity[]> {
    const raws = await prisma.product.findMany({
      where: {
        company: {
          phoneNumber: companyPhone,
        },
      },
    });

    return raws.map(ProductMapper.toDomain);
  }

  async findByIDAndFilterByCompanyID(
    productId: string,
    companyId: string
  ): Promise<ProductEntity | null> {
    const raw = await prisma.product.findUnique({
      where: { id: productId, companyId: companyId },
    });
    if (!raw) return null;
    return ProductMapper.toDomain(raw);
  }
}
