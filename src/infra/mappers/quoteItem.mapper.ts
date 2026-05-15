import { QuoteItem as QuoteItemEntity } from "../../domain/quoteItem";
import { Prisma, type QuoteItem } from "../../generated/prisma/client";
import type { QuoteItemParams } from "../../domain/types/domain.types";
export class QuoteItemMapper {
  static toPersistence(
    quoteItem: QuoteItemEntity
  ): Prisma.QuoteItemUncheckedCreateInput {
    return {
      id: quoteItem.id,
      quoteId: quoteItem.quoteId,
      productId: quoteItem.productId,
      parameters: quoteItem.parameters as Prisma.InputJsonObject,
      status: quoteItem.status,
      calculatedPrice: quoteItem.calculatedPrice,
      isParamsCompleted: quoteItem.isParamsCompleted,
      createdAt: quoteItem.createdAt,
    };
  }

  static toDomain(raw: QuoteItem): QuoteItemEntity {
    return QuoteItemEntity.fromPersistence({
      id: raw.id,
      quoteId: raw.quoteId,
      productId: raw.productId,
      parameters: QuoteItemMapper.parseParameters(raw.parameters),
      status: raw.status,
      calculatedPrice:
        raw.calculatedPrice == undefined
          ? null
          : raw.calculatedPrice.toNumber(),
      isParamsCompleted: raw.isParamsCompleted,
      createdAt: raw.createdAt,
    });
  }

  private static parseParameters(value: Prisma.JsonValue): QuoteItemParams | null{
    if(value === null) return null
    if (value === undefined || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Invalid QuoteItemParams");
    }

    const result: QuoteItemParams = {};

    for (const [key, val] of Object.entries(value as Prisma.JsonObject)) {
      const valid =
        typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean" ||
        val === null;

      if (!valid) {
        throw new Error(`Invalid value for "${key}"`);
      }

      result[key] = val;
    }

    return result;
  }
}
