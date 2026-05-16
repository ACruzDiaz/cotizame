import type { Intention } from "../../application/types/app.types";
import type { QuoteItemParams } from "../types/domain.types";

export type MessageAnalisysAiType = {
  itemParameters: QuoteItemParams | undefined
  intention: Intention | undefined
}

export interface IArtificialInteligence {
  startAnalize(message:string, quoteItemParams?: QuoteItemParams): Promise<MessageAnalisysAiType>
}