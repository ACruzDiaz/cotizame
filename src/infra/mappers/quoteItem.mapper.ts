import { QuoteItem as QuoteItemEntity } from "../../domain/quoteItem";
import {
  Prisma,
  type QuoteItem,
} from "../../generated/prisma/client";

export class QuoteItemMapper {
  static toPersistence(
    quoteItem: QuoteItemEntity
  ): Prisma.QuoteItemUncheckedCreateInput {
    return {
      id: quoteItem.id,
      quoteId: quoteItem.quoteId,
      productId: quoteItem.productId,
      parameters: quoteItem.parameters,
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
      productId: raw.productId === null ? undefined : raw.productId,
      parameters: QuoteItemMapper.parseParameters(raw.parameters) ?? {},
      status: raw.status,
      calculatedPrice: raw.calculatedPrice?.toNumber(),
      isParamsCompleted: raw.isParamsCompleted,
      createdAt: raw.createdAt,
    });
  }

  private static parseParameters(
    value: unknown
  ): Prisma.JsonObject | undefined {
    if (value === null || value === undefined) return undefined;

    let parsed: unknown = value;
    if (typeof value === "string") {
      try {
        parsed = JSON.parse(value);
      } catch {
        // if it's a plain string that isn't JSON, store it under a default key
        return { value: value as string };
      }
    }
    // Convert a DB value (Record<string, any> | string | null) into a JsonObject accepted by domain

    const convert = (v: unknown): Prisma.JsonValue => {
      if (v === null) return null;
      if (Array.isArray(v)) return v.map(convert);
      const t = typeof v;
      if (t === "string" || t === "number" || t === "boolean")
        return v as string | number | boolean;
      if (v instanceof Date) return v.toISOString();
      if (t === "object") {
        const obj = v as Record<string, unknown>;
        const out: Record<string, Prisma.JsonValue> = {};
        for (const [k, val] of Object.entries(obj)) {
          out[k] = convert(val);
        }
        return out;
      }
      // fallback to string representation
      return String(v);
    };

    const converted = convert(parsed);
    if (
      converted &&
      typeof converted === "object" &&
      !Array.isArray(converted)
    ) {
      return converted as Prisma.JsonObject;
    }

    // If the parsed value is not an object, wrap it so domain always receives a JsonObject
    return { value: converted as Prisma.JsonValue };
  }
}
