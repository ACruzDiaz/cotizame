import z, { string } from "zod";
import { Intention } from "../types/app.types";

type JsonPers = string | number | boolean;

export type BodyReq = {
  clientPhone: string;
  companyPhone: string;
  productId?: string | undefined;
  itemParameters?: Record<string, JsonPers> | undefined;
  intention?: Intention | undefined;
};

const jsonValueSchema: z.ZodType<JsonPers> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean()])
);

const bodySchema = z.object({
  clientPhone: z.string().regex(/^\+?[0-9]+$/, "Invalid phone number format"),
  companyPhone: z.string().regex(/^\+?[0-9]+$/, "Invalid phone number format"),
  productId: z.uuid("Invalid UUID").optional(),
  itemParameters: z.record(z.string(), jsonValueSchema).optional(),
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
