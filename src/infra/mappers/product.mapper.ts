import type { InputJsonValue, JsonValue } from "@prisma/client/runtime/client";
import { Product as ProductEntity } from "../../domain/product";
import { Prisma, type Product } from "../../generated/prisma/client";
import type {
  ProductParams,
  AllowedProductParams,
} from "../../domain/types/domain.types";
export class ProductMapper {
  static toPersistence(
    product: ProductEntity
  ): Prisma.ProductUncheckedCreateInput {
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
      parameters: ProductMapper.parseProductParams(raw.parameters),
      description: raw.description,
      notes: raw.notes,
      basePrice: raw.basePrice.toNumber(),
      dynamicPricingDsl: JSON.parse(JSON.stringify(raw.dynamicPricingDsl)),
      deletedAt: raw.deletedAt,
    });
  }

  private static parseProductParams(value: JsonValue): ProductParams {
    const allowed = ["boolean", "string", "number"];

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Invalid ProductParams");
    }

    for (const val of Object.values(value)) {
      if (typeof val !== "string" || !allowed.includes(val)) {
        throw new Error("Invalid ProductParams");
      }
    }

    return value as ProductParams;
  }
}
