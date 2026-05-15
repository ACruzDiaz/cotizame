import { Prisma } from "./generated/prisma/client";
import type { QuoteItemParams } from "./domain/types/domain.types";
import type { ProductParams } from "./domain/types/domain.types";
function areParamsCompleted(
    current: QuoteItemParams,
    base: ProductParams
  ): boolean {

    const currentKeys = Object.keys(current);
    const baseKeys = Object.keys(base);

    // mismos keys
    if (
      currentKeys.length !== baseKeys.length ||
      !baseKeys.every((key) => key in current)
    ) {
      return false;
    }

    return baseKeys.every((key) => {
      const value = current[key];
      const expectedType = base[key];

      // null y undefined no son válidos
      if (value === null || value === undefined) {
        return false;
      }

      return typeof value === expectedType;
    });
  }

  const data: QuoteItemParams = {m2: 3, urgency: true}
  const base: ProductParams = {m2:"number", urgency: "boolean"}
  console.log(
    areParamsCompleted(data,base)
  );