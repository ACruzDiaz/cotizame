import z, { string } from "zod"
import { Intention } from "../types/app.types";

type JsonPers =
  | string
  | number
  | boolean
  | JsonPers[]
  | { [key: string]: JsonPers };

const jsonValueSchema: z.ZodType<JsonPers> =
  z.lazy(() =>
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(jsonValueSchema),
      z.record(z.string(), jsonValueSchema),
    ])
  );

const bodySchema = z.object({
  clientPhone: z.string().regex(/^\+?[0-9]+$/, "Invalid phone number format"),
  companyPhone: z.string().regex(/^\+?[0-9]+$/, "Invalid phone number format"),
  productId: z.uuid("Invalid UUID").optional(),
  itemParameters: z.record(z.string(),jsonValueSchema).optional(),
  intention: z.enum(Intention).optional()
})

export class ChatRequestDTO{
  private constructor(){};
  public static body(data:unknown){
    try {
      return bodySchema.parse(data);
    } catch (error) {
      console.log('Parse error ChatRequestDTO');
      throw new Error("Parse error ChatRequestDTO");
    }
  }
}