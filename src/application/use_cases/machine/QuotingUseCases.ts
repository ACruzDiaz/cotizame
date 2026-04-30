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
import type { QIStatus, QuoteStatus } from "../../../generated/prisma/enums";
import type { QuoteItemService } from "../../services/quoteItem.service";
import type { IQuotingUseCases } from "./IQuotingUseCases";
import type { ProductService } from "../../services/product.service";
import type { QuoteService } from "../../services/quote.service";

class QuotingUseCases implements IQuotingUseCases {
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
  createEmptyQuote(): Quote {
    throw new Error("Method not implemented.");
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

  async updateQuoteItem(quoteItem: QuoteItem): Promise<QuoteItem> {
    return await this.quoteItemService.update(quoteItem);
  }
  async updateQuote(quote: Quote): Promise<Quote> {
    return await this.quoteService.update(quote);
  }
}
