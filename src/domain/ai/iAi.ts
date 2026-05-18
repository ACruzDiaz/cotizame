import type { Intention } from "../../application/types/app.types";
import type { Product } from "../product";
import type { AllowedQuoteItemParams, ProductParams, QuoteItemParams } from "../types/domain.types";

export type MessageAnalisysAiType = {
  intention: Intention | undefined
}

export interface IArtificialInteligence {
  startAnalize(message:string): Promise<MessageAnalisysAiType>
  getInferProduct(message: string, productList: Product[]): Promise<Product | undefined>
  getQuoteItemParams(message: string, quoteItemParams: QuoteItemParams | undefined, productParams: ProductParams): Promise<QuoteItemParams>;
}