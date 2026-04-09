import * as z from "zod";

const createSchema = z.object({
  companyId: z.uuid("Invalid UUID"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  parameters: z.any(),
  description: z.string().max(500).optional(),
  notes: z.string().max(2000).optional().nullable(),
  basePrice: z.number().min(0, "Price cannot be negative"),
  dynamicPricingDsl: z.any(),
});

const removeSchema = z.object({
  id: z.uuid("Invalid UUID"),
});

const updateSchema = z.object({
  id: z.uuid("Invalid UUID"),
  companyId: z.uuid("Invalid UUID").optional(),
  name: z.string().trim().min(2).max(100).optional(),
  parameters: z.any().optional(),
  description: z.string().max(500).optional(),
  notes: z.string().max(2000).optional().nullable(),
  basePrice: z.number().min(0).optional(),
  dynamicPricingDsl: z.any().optional(),
});

const getByPropertySchema = z.object({
  companyId: z.uuid("Invalid UUID").optional(),
  name: z.string().trim().optional(),
});

export type CreateInput = z.infer<typeof createSchema>;
export type RemoveInput = z.infer<typeof removeSchema>;
export type UpdateInput = z.infer<typeof updateSchema>;
export type GetByPropertyInput = z.infer<typeof getByPropertySchema>;

export class ProductRequestDTO {
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

  public static update(data: unknown): UpdateInput {
    try {
      return updateSchema.parse(data);
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
}
