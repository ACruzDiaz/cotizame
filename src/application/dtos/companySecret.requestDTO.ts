import * as z from "zod";

const createSchema = z.object({
  companyId: z.uuid("Invalid UUID"),
  whatsappTokenHash: z.string().min(5).max(100),
  phoneNumberId: z.string().min(5).max(50),
});

const removeSchema = z.object({
  companyId: z.uuid("Invalid UUID"),
});

const updateSchema = z.object({
  companyId: z.uuid("Invalid UUID"),
  whatsappTokenHash: z.string().min(5).max(100).optional(),
  phoneNumberId: z.string().min(5).max(50).optional(),
});

const getByPropertySchema = z.object({
  companyId: z.uuid("Invalid UUID").optional(),
  whatsappTokenHash: z.string().min(5).max(100).optional(),
  phoneNumberId: z.string().min(5).max(50).optional(),
});

const getByIdSchema = z.object({
  companyId: z.uuid("Invalid UUID"),
});

export type CreateInput = z.infer<typeof createSchema>;
export type RemoveInput = z.infer<typeof removeSchema>;
export type UpdateInput = z.infer<typeof updateSchema>;
export type GetByPropertyInput = z.infer<typeof getByPropertySchema>;
export type GetByIdInput = z.infer<typeof getByIdSchema>;

export class CompanySecretRequestDTO {
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

  public static getById(data: unknown): GetByIdInput {
    try {
      return getByIdSchema.parse(data);
    } catch (err) {
      throw err;
    }
  }
}
