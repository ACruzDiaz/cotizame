import { prisma } from "../connection/prismaClient";
import type { DynamicPricingDsl } from "../../engine/dsl.types";
import type { Prisma, Product } from "../../generated/prisma/client";
import type { ProductWhereInput } from "../../generated/prisma/models";

//TODO. Cambiar a ProductServiceImpl y crear una interface ProductService

type ProductCreatePayload = Prisma.ProductGetPayload<{
  select: {
    id: true;
  };
}>;

type ProductDeletePayload = Prisma.ProductGetPayload<{
  select: {
    id: true;
  };
}>;
export class ProductService {
  constructor() {}

  public async create(
    companyId: string,
    name: string,
    parameters: Prisma.InputJsonValue,
    description: string,
    notes: string | null,
    basePrice: number,
    dynamicPricingDsl: Prisma.InputJsonValue
  ): Promise<ProductCreatePayload> {
    try {
      return await prisma.product.create({
        data: {
          companyId,
          name,
          parameters,
          description,
          notes,
          basePrice,
          dynamicPricingDsl,
        },
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create a Product. Details: ${error} `);
    }
  }

  public async remove(id: string): Promise<ProductDeletePayload> {
    try {
      return await prisma.product.update({
        where: { id },
        data: { deletedAt: new Date().toISOString() },
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete product. details ${error}`);
    }
  }

  public async update(
    id: string,
    data: Prisma.ProductUpdateInput
  ): Promise<{ id: string }> {
    try {
      return await prisma.product.update({
        where: { id, deletedAt: null },
        data,
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update product. details ${error}`);
    }
  }

  //En caso de que la empresa tenga demasiados productos. Implementar una respuesta con paginacion
  // Agregar una funcion para ocultar productos. En caso de que la empresa no lo quiera prestar temporalmente.
  public async getAll(cid:string): Promise<Product[]> {
    try {
      return await prisma.product.findMany({
        where: {
          companyId:cid,
          deletedAt: null,
        },
      });
    } catch (error) {
      throw new Error(`Failed to get all products. details ${error}`);
    }
  }
  public async getByProperty(
    where: Prisma.ProductWhereInput
  ): Promise<Product[]> {
    try {
      return await prisma.product.findMany({
        where: {
          AND: [where, { deletedAt: null }],
        },
      });
    } catch (error) {
      throw new Error(`Failed to get products by property. details ${error}`);
    }
  }
}
