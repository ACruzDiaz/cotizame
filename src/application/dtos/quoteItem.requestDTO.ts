import * as z from "zod";

const createSchema = z.object({
  quoteId: z.uuid("Invalid UUID"),
  productId: z.uuid("Invalid UUID"),
  parameters: z.any(),
  calculatedPrice: z.number().min(0, "Calculated price cannot be negative"),
});

const removeSchema = z.object({
  id: z.uuid("Invalid UUID"),
});

const getByPropertySchema = z.object({
  quoteId: z.uuid("Invalid UUID").optional(),
  productId: z.uuid("Invalid UUID").optional(),
});

const getByIdSchema = z.object({
  id: z.uuid("Invalid UUID"),
});

export type CreateInput = z.infer<typeof createSchema>;
export type RemoveInput = z.infer<typeof removeSchema>;
export type GetByPropertyInput = z.infer<typeof getByPropertySchema>;
export type GetByIdInput = z.infer<typeof getByIdSchema>;

export class QuoteItemRequestDTO {
  constructor() {}

  public static create(data: unknown): CreateInput {
    try {
      return createSchema.parse(data);
    } catch (err) {
      throw err;
    }
  }

  public static remove(data: unknown): RemoveInput {
    try {
      return removeSchema.parse(data);
    } catch (err) {
      throw err;
    }
  }

  public static getByProperty(data: unknown): GetByPropertyInput {
    try {
      return getByPropertySchema.parse(data);
    } catch (err) {
      throw err;
    }
  }

  public static getById(data: unknown): GetByIdInput {
    try {
      return getByIdSchema.parse(data);
    } catch (err) {
      throw err;
    }
  }
}
