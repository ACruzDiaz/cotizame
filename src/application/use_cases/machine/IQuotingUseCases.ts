import type { Quote, QuoteItem, Product } from "../../../generated/prisma/client";
import type { QIStatus, QuoteStatus } from "../../../generated/prisma/enums";

//Recuerda usar transaction al momento de crear quote y quoteitem
export interface IQuotingUseCases {
  generateGreatingMessage(): string;
  generateProductListMessage(): string;
  genereteRemainingParamsMessage(): string;
  generateFinalQuoteMessage(): string;

  createEmptyQuoteItem(quoteId:string):Promise<QuoteItem>;
  createQuoteItemWithAProduct(productId: string, quoteId: string): Promise<QuoteItem>;
  updateQuoteItemProductParameters(parameters: unknown): QuoteItem;
  
  updateQuoteItemProductId(quoteId:string, productId:string):Promise<QuoteItem>
  updateQuoteItemStatus(status: QIStatus): QuoteItem;
  updateQuoteStatus(status: QuoteStatus): Quote;

  getSelectedProduct(productName: string): Promise<Product>;

  getMissingParams(quoteItem: QuoteItem): string[];
  remainingParams(quoteItem: QuoteItem): boolean;

  //Change state
  updateQuoteItemState(quoteItem:QuoteItem, quoteItemStatus: QIStatus): QuoteItem;
  updateQuoteState(quote: Quote,  quoteStatus: QuoteStatus): Quote;



  //Update whole entity
  updateQuoteItem(quoteItemId:string, quoteItem: QuoteItem):Promise<QuoteItem>;
  updateQuote(quoteId:string, quote:Quote): Promise<Quote>
}
