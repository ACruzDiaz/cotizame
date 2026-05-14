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
import type { Command } from "./commandExecutor";
import { executeCommands, type CommandResult } from "./commandExecutor";

export class QuoteContext {
  private state: State;
  private pendingCommands: Command[] = [];
  private commandResults: CommandResult[] = [];
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

  setReceivedParams() {

    const isPlainObject = (v: unknown): v is Record<string, unknown> =>
      v !== null && typeof v === "object" && !Array.isArray(v);

    const src = isPlainObject(this.parameters)
      ? (this.parameters as Record<string, unknown>)
      : {};
    const dest = isPlainObject(this.quoteItemEntity.parameters)
      ? (this.quoteItemEntity.parameters as Record<string, unknown>)
      : {};
    for (const [key, value] of Object.entries(src)) {
      if (value !== null && value !== undefined) {
        dest[key] = value;
      }
    }

    this.quoteItemEntity.parameters = dest as JsonValue;
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
    // domain transition: enter may mutate in-memory entities and enqueue commands
    // await this.state.enter();
    // after domain changes, execute pending application commands in one place (centralized executor)
    this.commandResults = await executeCommands(
      this.pendingCommands,
      this.quotingUseCases,
      {
        quoteEntity: this.quoteEntity,
        quoteItemEntity: this.quoteItemEntity,
        setQuoteItemEntity: this.setQuoteItemEntity.bind(this),
        setQuoteEntity: this.setQuoteEntity.bind(this),
        setResponseMessage: this.setResponseMessage.bind(this),
      }
    );
    // clear pendingCommands after execution
    this.pendingCommands = [];
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
      if (!productParams) return;
      this.quoteItemEntity.parameters = Object.fromEntries(
        Object.entries(productParams).map(([key]) => [key, null])
      );
    }
  }

  // domain read that does not mutate state can still be enqueued and executed centrally
  enqueueShowProducts() {
    this.pendingCommands.push({ type: "showProducts" });
  }

  getMissingParams(): string[] {
    return this.quotingUseCases.getMissingParams(this.quoteItemEntity);
  }

  // persistence helpers (called centrally by executePendingCommands)
  async persistUpdateQuoteItemEntity(): Promise<QuoteItem> {
    return this.quotingUseCases.updateQuoteItem(
      this.quoteItemEntity.id,
      this.quoteItemEntity
    );
  }
  async persistUpdateQuoteEntity(): Promise<Quote> {
    return this.quotingUseCases.updateQuote(
      this.quoteEntity.id,
      this.quoteEntity
    );
  }
  // enqueue cancel operations so persistence is centralized
  cancelQuote() {
    this.pendingCommands.push({
      type: "updateQuoteState",
      payload: { status: QuoteStatus.Canceled },
    });
  }
  cancelQuoteItem() {
    this.pendingCommands.push({
      type: "updateQuoteItemState",
      payload: { status: QIStatus.Initializing },
    });
  }
  finishQuote() {}

  // Enqueue domain commands from states so persistence is centralized
  enqueueCreateEmptyQuoteItem() {
    this.pendingCommands.push({ type: "createEmptyQuoteItem" });
  }
  enqueueCreateQuoteItemWithProduct(productId: string) {
    this.pendingCommands.push({
      type: "createQuoteItemWithProduct",
      payload: { productId },
    });
  }
  enqueueUpdateQuoteItemProduct() {
    if (!this.productEntity || !this.productEntity.id)
      throw new Error("No productId provided");
    if (!this.quoteItemEntity || !this.quoteItemEntity.id)
      throw new Error("No QuoteItemId provided");
    this.pendingCommands.push({
      type: "updateQuoteItemProduct",
      payload: {
        quoteItemId: this.quoteItemEntity.id,
        productId: this.productEntity.id,
      },
    });
  }

  getCommandResults(): CommandResult[] {
    return this.commandResults;
  }
}
