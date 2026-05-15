export type AllowedQuoteItemParams = string | number | boolean | null;
export type QuoteItemParams = Record<string, AllowedQuoteItemParams>;

export type AllowedProductParams = "boolean" | "string" | "number";
export type ProductParams = Record<string, AllowedProductParams>;
