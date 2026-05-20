import z from "zod";
import { Intention } from "../types/app.types.js";
import type {
  ProductParams,
  AllowedQuoteItemParams,
  QuoteItemParams,
} from "../../domain/types/domain.types.js";

export function createSchema(baseParams: ProductParams) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, type] of Object.entries(baseParams)) {
    switch (type) {
      case "string":
        shape[key] = z.string().nullable();
        break;

      case "number":
        shape[key] = z.number().nullable();
        break;

      case "boolean":
        shape[key] = z.boolean().nullable();
        break;

      default:
        throw new Error(`Tipo no soportado: ${type}`);
    }
  }

  return z.object(shape);
}

/**
 * Parsea y valida itemParams
 */
export function parseParams(
  baseParams: ProductParams,
  itemParams: QuoteItemParams
): QuoteItemParams {
  const schema = createSchema(baseParams);

  return schema.parse(itemParams) as QuoteItemParams;
}

export type BodyReq = {
  clientPhone: string;
  companyPhone: string;
  message: string;
  clientName?: string | undefined;
  intention?: Intention | undefined;
};

const bodySchema = z.object({
  clientPhone: z.string().regex(/^\+?[0-9]+$/, "Invalid phone number format"),
  companyPhone: z.string().regex(/^\+?[0-9]+$/, "Invalid phone number format"),
  message: z.string(),
  clientName: z.string().optional(),
  intention: z.enum(Intention).optional(),
});

export class ChatRequestDTO {
  private constructor() {}
  public static body(data: unknown) {
    try {
      const res: BodyReq = bodySchema.parse(data);
      return res;
    } catch (error) {
      throw error
    }
  }
}
