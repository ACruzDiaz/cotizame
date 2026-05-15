import { prisma } from "../../application/connection/prismaClient";
import { ProductMapper } from "../mappers/product.mapper";
import { Product as ProductEntity } from "../../domain/product";
import type { ProductRepository } from "../../domain/repository/productRepository";

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
}
