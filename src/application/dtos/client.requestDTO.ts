import * as z from "zod";

const createSchema = z.object({
  companyId: z.uuid("Invalid UUID"),
  clientPhone: z.string().regex(/^\+?[0-9]+$/, "Invalid phone number format"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .optional()
    .transform((val) => val ?? null),
});

const updateSchema = z.object({
  id: z.uuid("Invalid UUID"),
  companyId: z.uuid("Invalid UUID").optional(),
  clientPhone: z
    .string()
    .regex(/^\+?[0-9]+$/, "Invalid phone number format")
    .optional(),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .optional(),
});

const getByPropertySchema = z.object({
  companyId: z.uuid("Invalid UUID").optional(),
  clientPhone: z
    .string()
    .regex(/^\+?[0-9]+$/, "Invalid phone number format")
    .optional(),
  name: z.string().trim().optional(),
});

const getByIdSchema = z.object({
  id: z.uuid("Invalid UUID"),
});

const companyPhoneSchema = z.object({
  companyPhone: z
    .string()
    .regex(/^\+?[0-9]+$/, "Invalid phone number format")
});

const clientPhoneSchema = z.object({
  clientPhone: z
    .string()
    .regex(/^\+?[0-9]+$/, "Invalid phone number format")
});


export type CreateInput = z.infer<typeof createSchema>;
export type UpdateInput = z.infer<typeof updateSchema>;
export type GetByPropertyInput = z.infer<typeof getByPropertySchema>;
export type GetByIdInput = z.infer<typeof getByIdSchema>;
export type CompanyPhoneInput = z.infer<typeof companyPhoneSchema>;
export type ClientPhoneInput = z.infer<typeof clientPhoneSchema>;

export class ClientRequestDTO {
  constructor() {}

  public static create(data: unknown): CreateInput {
    try {
      return createSchema.parse(data);
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
  public static companyPhone(data: unknown): CompanyPhoneInput {
    try {
      return companyPhoneSchema.parse(data);
    } catch (err) {
      throw err;
    }
  }
  public static clientPhone(data: unknown): ClientPhoneInput {
    try {
      return clientPhoneSchema.parse(data);
    } catch (err) {
      throw err;
    }
  }
}
