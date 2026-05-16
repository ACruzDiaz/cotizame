import z from "zod";
import { Intention } from "../../../application/types/app.types";
import type { AllowedQuoteItemParams } from "../../../domain/types/domain.types";


const jsonValueSchema: z.ZodType<AllowedQuoteItemParams> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null()])
);

export const qIParamsSchema = z.object({
  itemParameters: z.record(z.string(), jsonValueSchema).optional(),
});

export const intentionSchema = z.object({
  intention: z.enum(Intention).optional(),
});