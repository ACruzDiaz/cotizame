import * as z from "zod";
import { UserRole } from "../../generated/prisma/client";

const createSchema = z.object({
  companyId: z.uuid("Invalid UUID"),
  email: z.email("Invalid email format"),
  passwordHash: z.string().min(8, "Password hash is required"),
  role: z.enum(UserRole, "Invalid user role").optional(),
});

const removeSchema = z.object({
  id: z.uuid("Invalid UUID"),
});

const updateSchema = z.object({
  id: z.uuid("Invalid UUID"),
  companyId: z.uuid("Invalid UUID").optional(),
  email: z.email("Invalid email format").optional(),
  passwordHash: z.string().min(8).optional(),
  role: z.enum(UserRole, "Invalid user role").optional(),
});

const getByPropertySchema = z.object({
  companyId: z.uuid("Invalid UUID").optional(),
  email: z.email("Invalid email format").optional(),
  role: z.enum(UserRole, "Invalid user role").optional(),
});

const getByIdSchema = z.object({
  id: z.uuid("Invalid UUID"),
});

export type CreateInput = z.infer<typeof createSchema>;
export type RemoveInput = z.infer<typeof removeSchema>;
export type UpdateInput = z.infer<typeof updateSchema>;
export type GetByPropertyInput = z.infer<typeof getByPropertySchema>;
export type GetByIdInput = z.infer<typeof getByIdSchema>;

export class UserRequestDTO {
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
