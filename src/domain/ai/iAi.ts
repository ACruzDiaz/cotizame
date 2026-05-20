import type { Intention } from "../../application/types/app.types.js";
import type { Product } from "../product.js";
import type { AllowedQuoteItemParams, ProductParams, QuoteItemParams } from "../types/domain.types.js";

export type MessageAnalisysAiType = {
  intention: Intention | undefined
}

export interface IArtificialInteligence {
  startAnalize(message:string): Promise<MessageAnalisysAiType>
  getInferProduct(message: string, productList: Product[]): Promise<Product | undefined>
  getQuoteItemParams(message: string, quoteItemParams: QuoteItemParams | undefined, productParams: ProductParams): Promise<QuoteItemParams>;
}