import * as z from "zod";
import { CompanyTier } from "../../generated/prisma/client.js";

const createSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  phoneNumber: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(
      /^\+?[0-9]+$/,
      "Invalid phone number format",
    ),
});

const assignSecretSchema = z.object({
  companyId: z.uuid("Invalid UUID"),
  whatsappTokenHash: z.string().min(5).max(50),
  phoneNumberId: z.string().min(5).max(50),
});

const getByPhoneNumberSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(
      /^\+?[0-9]+$/,
      "Invalid phone number format",
    ),
});

const getByIdSchema = z.object({
  id: z.uuid("Invalid UUID"),
});

const updateTierSchema = z.object({
  id: z.uuid("Invalid UUID"),
  tier: z.enum(CompanyTier, "Invalid tier")
});



export type CreateInput = z.infer<typeof createSchema>;
export type AssignSecretInput = z.infer<typeof assignSecretSchema>;
export type GetByPhoneNumberInput = z.infer<typeof getByPhoneNumberSchema>;
export type GetByIdInput = z.infer<typeof getByIdSchema>;
export type UpdateTierInput = z.infer<typeof updateTierSchema>;

export class CompanyRequestDTO {
  constructor() {}

  public static create(data: unknown): CreateInput {
    try {
      return createSchema.parse(data);
    } catch (err) {
      throw err;
    }
  }

  public static assignSecret(data: unknown): AssignSecretInput {
    try {
      return assignSecretSchema.parse(data);
    } catch (err) {
      throw err;
    }
  }

  public static getByPhoneNumber(data: unknown): GetByPhoneNumberInput {
    try {
      return getByPhoneNumberSchema.parse(data);
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

  public static updateTier(data: unknown): UpdateTierInput {
    try {
      return updateTierSchema.parse(data);
    } catch (err) {
      throw err;
    }
  }
}
