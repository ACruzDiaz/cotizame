import z, { string } from "zod";
import { Intention } from "../types/app.types";
import type { QuoteItemParams, AllowedQuoteItemParams} from "../../domain/types/domain.types";

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
      console.log("Parse error ChatRequestDTO");
      throw new Error("Parse error ChatRequestDTO");
    }
  }
}
