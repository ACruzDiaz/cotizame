import { type JsonValue } from "@prisma/client/runtime/client";
import {
  QIStatus,
  QuoteStatus,
  type Product,
  type Quote,
  type QuoteItem,
} from "../../../generated/prisma/client";
import type { IQuotingUseCases } from "./IQuotingUseCases";
import { Intention } from "../state.types";
import { State, UndefinedState } from "./StateFactory";
import { ShowProductsUseCase } from "../showProducts.usecase";
import { ProductService } from "../../services/product.service";
export class QuoteContext {
  private state: State;
  constructor(
    protected quoteEntity: Quote,
    protected quoteItemEntity: QuoteItem,
    private quotingUseCases: IQuotingUseCases,
    private productEntity?: Product,
    private parameters?: JsonValue,
    private responseMessage?: string,
    private userIntention?: Intention
  ) {
    this.state = new UndefinedState(this);
  }

  setQuoteItemStatus(status: QIStatus) {
    this.quoteItemEntity.status = status;
  }
  setQuoteStatus(status: QuoteStatus) {
    this.quoteEntity.status = status;
  }

  getQuoteItemEntity() {
    return this.quoteItemEntity;
  }
  
  getQuoteEntity() {
    return this.quoteEntity;
  }

  getUserIntention(): Intention | undefined {
    return this.userIntention;
  }
  getResponseMessage(): string | undefined {
    return this.responseMessage;
  }
  setResponseMessage(message: string): void {
    this.responseMessage = message;
  }
  setQuoteEntity(quote: Quote) {
    this.quoteEntity = quote;
  }
  setQuoteItemEntity(quoteItem: QuoteItem) {
    this.quoteItemEntity = quoteItem;
  }
  async changeState(state: State): Promise<void> {
    this.state = state;
    // this.setQuoteItemStatus(state.quote.quoteItemEntity.status)
    // this.setQuoteStatus(state.quote.quoteEntity.status)

    await this.updateQuoteEntity();
    await this.updateQuoteItemEntity();
  }

  setStateDirect(state: State): void {
    this.state = state;
  }
  getState(): State {
    return this.state;
  }

  //Methods delegate execution
  initializing() {
    this.state.initializing();
  }
  selecting() {
    this.state.selecting();
  }
  filling() {
    this.state.filling();
  }
  done() {
    this.state.done();
  }

  //Service method of context.Se llaman desde las implementaciones state

  initializeQuoteItemParams() {
    if (this.productEntity) {
      const productParams = this.productEntity.parameters;
      if(!productParams) return
      this.quoteItemEntity.parameters = Object.fromEntries(
        Object.entries(productParams).map(([key]) => [key, null])
      );
    }
  }

  async showProducts() {
    let res = await new ShowProductsUseCase(new ProductService()).execute({
      companyId: this.quoteEntity.companyId,
    });
    return res;
  }

  getMissingParams(): string[] {
    return this.quotingUseCases.getMissingParams(this.quoteItemEntity);
  }

  async updateQuoteItemEntity(): Promise<QuoteItem> {
    return this.quotingUseCases.updateQuoteItem(this.quoteItemEntity.id, this.quoteItemEntity);
  }
  async updateQuoteEntity(): Promise<Quote> {
    return this.quotingUseCases.updateQuote(this.quoteEntity.id, this.quoteEntity);
  }
  cancelQuote() {
    return this.quotingUseCases.updateQuoteState(
      this.quoteEntity,
      QuoteStatus.Canceled
    );
  }
  cancelQuoteItem() {
    return this.quotingUseCases.updateQuoteItemState(
      this.quoteItemEntity,
      QIStatus.Initializing
    );
  }
  finishQuote() {}

  async createEmptyQuoteItem(): Promise<QuoteItem> {
    return await this.quotingUseCases.createEmptyQuoteItem(this.quoteEntity.id);
  }
  async setProduct(): Promise<void> {
    if (!this.productEntity || !this.productEntity.id)
      throw new Error("No product provided");
    await this.quotingUseCases.createQuoteItemWithAProduct(
      this.productEntity.id,
      this.quoteEntity.id
    );
  }
  async updateQuoteItemProduct(): Promise<void> {
    if (!this.productEntity || !this.productEntity.id)
      throw new Error("No productId provided");
    if (!this.quoteItemEntity || !this.quoteItemEntity.id!)
      throw new Error("No QuoteItemId provided");
    await this.quotingUseCases.updateQuoteItemProductId(
      this.quoteItemEntity.id,
      this.productEntity.id
    );
  }
}
