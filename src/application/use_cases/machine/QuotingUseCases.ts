import {
  JsonNull,
  type InputJsonValue,
  type JsonValue,
} from "@prisma/client/runtime/client";
import type {
  Quote,
  QuoteItem,
  Product,
} from "../../../generated/prisma/client";

import { QIStatus, type QuoteStatus } from "../../../generated/prisma/enums";
import type { QuoteItemService } from "../../services/quoteItem.service";
import type { IQuotingUseCases } from "./IQuotingUseCases";
import type { ProductService } from "../../services/product.service";
import type { QuoteService } from "../../services/quote.service";

export class QuotingUseCases implements IQuotingUseCases {
  constructor(
    private quoteService: QuoteService,
    private quoteItemService: QuoteItemService,
    private productService: ProductService
  ) {}
  generateGreatingMessage(): string {
    throw new Error("Method not implemented.");
  }
  generateProductListMessage(): string {
    throw new Error("Method not implemented.");
  }
  genereteRemainingParamsMessage(): string {
    throw new Error("Method not implemented.");
  }
  generateFinalQuoteMessage(): string {
    throw new Error("Method not implemented.");
  }
  async createEmptyQuoteItem(quoteId:string):Promise<QuoteItem> {
    return await this.quoteItemService.create({
      quoteId: quoteId,
      calculatedPrice : 0,
      parameters : {},
      status : QIStatus.Initializing
    })
  }

  async createQuoteItemWithAProduct(
    productId: string,
    quoteId: string
  ): Promise<QuoteItem> {
    const productList = await this.productService.getByProperty({
      id: productId,
    });
    const oneProduct: Product | null = productList?.[0] ?? null;
    if (!oneProduct) throw new Error("Este producto no es valido");

    return await this.quoteItemService.create({
      quoteId: quoteId,
      productId: oneProduct.id,
      parameters: JsonNull, //Ojito aqui
      status: "Initializing",
      calculatedPrice: 0, //Cuidado aqui, quiza null es mejor
    });
  }

  async updateQuoteItemProductId(quoteId: string, productId: string): Promise<QuoteItem> {
    const productList = await this.productService.getByProperty({id:productId});
    if(productList.length === 0)
      throw new Error("Product not founded");
    const product = productList[0]!;
    return await this.quoteItemService.update(quoteId,{productId: productId})
      
  }
  updateQuoteItemProductParameters(parameters: unknown): QuoteItem {
    throw new Error("Method not implemented.");
  }
  updateQuoteItemStatus(status: QIStatus): QuoteItem {
    throw new Error("Method not implemented.");
  }
  updateQuoteStatus(status: QuoteStatus): Quote {
    throw new Error("Method not implemented.");
  }
  getSelectedProduct(productName: string): Promise<Product> {
    throw new Error("Method not implemented.");
  }
  getMissingParams(quoteItem: QuoteItem): string[] {
    const parameters = quoteItem.parameters;
    if (!parameters || typeof parameters !== "object")
      throw new Error("Invalid params");
    return Object.entries(parameters)
      .filter(([_, value]) => value == null)
      .map(([key]) => key);
  }
  remainingParams(quoteItem: QuoteItem): boolean {
    throw new Error("Method not implemented.");
  }

  updateQuoteItemState(quoteItem: QuoteItem, status: QIStatus): QuoteItem {
    return { ...quoteItem, status };
  }

  updateQuoteState(quote: Quote, status: QuoteStatus): Quote {
    return { ...quote, status };
  }



  async updateQuoteItem(id:string, quoteItem: QuoteItem): Promise<QuoteItem> {
    return await this.quoteItemService.update(id, {
      productId: quoteItem.productId,
      parameters: quoteItem.parameters as InputJsonValue,
      status: quoteItem.status,
      calculatedPrice: quoteItem.calculatedPrice
    });
  }
  async updateQuote(id:string, quote: Quote): Promise<Quote> {
    return await this.quoteService.update(id, {
      status: quote.status,
      totalAmount: quote.totalAmount,
      pdfUrl: quote.pdfUrl,
    });
  }
}
