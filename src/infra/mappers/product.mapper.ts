import type { InputJsonValue } from "@prisma/client/runtime/client";
import { Product as ProductEntity } from "../../domain/product";
import { Prisma, type Product } from "../../generated/prisma/client";

export class ProductMapper {
  static toPersistence(product: ProductEntity): Prisma.ProductUncheckedCreateInput {
    return {
      id: product.id,
      companyId: product.companyId,
      name: product.name,
      parameters: product.parameters as InputJsonValue,
      description: product.description,
      notes: product.notes,
      basePrice: product.basePrice,
      dynamicPricingDsl: JSON.parse(JSON.stringify(product.dynamicPricingDsl)),
      deletedAt: product.deletedAt,
    };
  }

  static toDomain(raw: Product): ProductEntity {
    return ProductEntity.fromPersistence({
      id: raw.id,
      companyId: raw.companyId,
      name: raw.name,
      parameters: raw.parameters,
      description: raw.description,
      notes: raw.notes,
      basePrice: raw.basePrice.toNumber(),
      dynamicPricingDsl: JSON.parse(JSON.stringify(raw.dynamicPricingDsl)),
      deletedAt: raw.deletedAt,
    });
  }
}
