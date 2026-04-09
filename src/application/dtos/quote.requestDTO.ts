import * as z from "zod";
import { QuoteStatus } from "../../generated/prisma/client";

const createSchema = z.object({
  companyId: z.uuid("Invalid UUID"),
  clientId: z.uuid("Invalid UUID"),
  totalAmount: z.number().min(0, "Total amount cannot be negative"),
  pdfUrl: z.string().url("Invalid URL format").optional().nullable(),
});

const removeSchema = z.object({
  id: z.uuid("Invalid UUID"),
});

const updateStatusSchema = z.object({}); // Placeholder for future usage

const addQuoteItemsSchema = z.object({}); // Placeholder for future usage

const getByPropertySchema = z.object({
  companyId: z.uuid("Invalid UUID").optional(),
  clientId: z.uuid("Invalid UUID").optional(),
  status: z.enum(QuoteStatus, "Invalid quote status").optional(),
});

const getByIdSchema = z.object({
  id: z.uuid("Invalid UUID"),
});

export type CreateInput = z.infer<typeof createSchema>;
export type RemoveInput = z.infer<typeof removeSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AddQuoteItemsInput = z.infer<typeof addQuoteItemsSchema>;
export type GetByPropertyInput = z.infer<typeof getByPropertySchema>;
export type GetByIdInput = z.infer<typeof getByIdSchema>;

export class QuoteRequestDTO {
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

  public static updateStatus(data: unknown): UpdateStatusInput {
    try {
      return updateStatusSchema.parse(data);
    } catch (err) {
      throw err;
    }
  }

  public static addQuoteItems(data: unknown): AddQuoteItemsInput {
    try {
      return addQuoteItemsSchema.parse(data);
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
