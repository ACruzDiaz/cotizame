import { Decimal, type JsonValue } from "@prisma/client/runtime/client";
import {
  QIStatus,
  QuoteStatus,
  type Product,
  type Quote,
  type QuoteItem,
} from "../../../generated/prisma/client";
import type { IQuotingUseCases } from "./IQuotingUseCases";
import { Intention } from "../state.types";


abstract class State {
  public quote: QuoteContext;
  constructor(quote: QuoteContext) {
    this.quote = quote;
    switch (this.quote.getUserIntention()) {
      case Intention.Cancel:
        break;
      case Intention.Complete:
        break;
      default:
        console.log("Ninguna accion ejecutada");
    }
  }

  abstract initializing(): void;
  abstract selecting(): void;
  abstract filling(): void;
  abstract done(): void;
  //Primero hay que hacer un commit y despues hacemos metodo default
}

class UndefinedState extends State {
  initializing(): void {
    throw new Error("Estado indefinido. Error");
  }
  filling(): void {
    throw new Error("Estado indefinido. Error");
  }
  selecting(): void {
    throw new Error("Estado indefinido. Error");
  }
  done(): void {
    throw new Error("Estado indefinido. Error");
  }
}

class DoneState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
    this.quoteCompleted();
  }
  initializing(): void {
    throw new Error("Method not implemented.");
  }
  filling(): void {
    throw new Error("Method not implemented.");
  }
  selecting(): void {
    throw new Error("Method not implemented.");
  }
  done(): void {
    throw new Error("Method not implemented.");
  }
  quoteCompleted(): void {
    console.log("Primer quoteItem completado");

    this.quote.changeState(new InitializingState(this.quote));
  }
}
class SelectingState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
  }
  initializing(): void {
    throw new Error("Method not implemented.");
  }
  filling(): void {
    throw new Error("Method not implemented.");
  }

  selecting(): void {
    try {
      this.quote.setProduct();
      console.log("Producto seleccionado correctamente");
    } catch (error) {
      console.log("Este mensaje va al usuario. Producto seleccionado invalido");
    }

    const paramsList = this.quote.getMissingParams();
    if (paramsList && paramsList.length == 0) {
      //Situacion que no deberia pasar
      console.log("Parametros completos");
      this.quote.changeState(new DoneState(this.quote))
    } else {
      console.log("Faltan por completar los siguientes parameter")
      this.quote.changeState(new FillingState(this.quote))
    }

  }
  done(): void {
    throw new Error("Method not implemented.");
  }
}

class InitializingState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
    if (this.quote.getQuoteEntity().status === "Pending") {
      this.initializing();
    }
  }
  async initializing(): Promise<void> {
    //Enviar un mensaje de bienvenida
    console.log("Este es un mensaje de bienvenida");
    //Despues enviar lista de productos
    console.log(await this.quote.showProducts());

    this.quote.setQuoteItemStatus("Selecting")
    this.quote.setQuoteStatus("Pending")

    this.quote.changeState(new SelectingState(this.quote));
  }
  selecting(): void {}
  filling(): void {
    throw new Error("Method not implemented.");
  }
  done(): void {
    throw new Error("Method not implemented.");
  }
}

class FillingState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
  }

  initializing(): void {
    throw new Error("Method not implemented.");
  }
  filling(): void {
    const paramsList = this.quote.getMissingParams();
    if (paramsList && paramsList.length == 0) {
      console.log("Parametros completos");
      this.quote.setQuoteItemStatus("Done");
      this.quote.changeState(new DoneState(this.quote));
    } else {
      this.quote.setQuoteItemStatus("Filling");
      this.quote.changeState(new FillingState(this.quote));
    }
  }
  selecting(): void {
    throw new Error("Method not implemented.");
  }

  done(): void {
    throw new Error("Method not implemented.");
  }
}
class CanceledState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
  }
  initializing(): void {
    //nada
  }

  filling(): void {
    //nada
  }
  selecting(): void {}

  done(): State {
    const quoteUpdated = this.quote.cancelQuote();
    const quoteItemUpdated = this.quote.cancelQuoteItem();
    const nextState = new InitializingState(this.quote);
    //Enviar mensaje de quote cancelado
    nextState.quote.setResponseMessage("Mensaje generado");
    nextState.quote.setQuoteEntity(quoteUpdated);
    nextState.quote.setQuoteItemEntity(quoteItemUpdated);
    return nextState;
  }
}


export class StateFactory {
  private state: State;
  constructor(private quoteContext: QuoteContext) {
    this.state = this.init();
  }

  private init(): State {
    let preState: State;
    switch (this.quoteContext.getQuoteItemEntity().status) {
      case QIStatus.Initializing:
        preState = new InitializingState(this.quoteContext);
        break;
      case QIStatus.Selecting:
        preState = new SelectingState(this.quoteContext);
        break;
      case QIStatus.Filling:
        preState = new FillingState(this.quoteContext);
        break;
      case QIStatus.Done:
        preState = new DoneState(this.quoteContext);
        break;
      default:
        throw new Error("undefined State enum");
    }
    preState.quote.changeState(preState);
    return preState;
  }
}

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
    this.state = new UndefinedState(this); //El estado será cargado desde StateFactory
  }
  setQuoteItemStatus(status: QIStatus) {
    this.quoteItemEntity.status = status;
  }
  setQuoteStatus(status: QuoteStatus) {
    this.quoteEntity.status = status;
  }

  getQuoteItemEntity(){
    return this.quoteItemEntity
  }

  getQuoteEntity(){
    return this.quoteEntity
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
  changeState(state: State) {
    this.state = state;
    this.updateQuoteEntity();
    this.updateQuoteItemEntity(); // Should be await
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
  updateQuoteItemParams() {}

  async showProducts() {
    return "Lista de products";
  }

  getMissingParams(): string[] {
    return this.quotingUseCases.getMissingParams(this.quoteItemEntity);
  }

  async updateQuoteItemEntity(): Promise<QuoteItem> {
    return this.quotingUseCases.updateQuoteItem(this.quoteItemEntity);
  }
  async updateQuoteEntity(): Promise<Quote> {
    return this.quotingUseCases.updateQuote(this.quoteEntity);
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

  async setProduct(): Promise<void> {
    if (!this.productEntity || !this.productEntity.id)
      throw new Error("No product provided");
    await this.quotingUseCases.createQuoteItemWithAProduct(
      this.productEntity.id,
      this.quoteEntity.id
    );
  }
}
