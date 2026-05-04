import { QIStatus } from "../../../generated/prisma/enums";
import { QuoteContext } from "./contextMachine";
import { Intention } from "../state.types";

export class StateFactory {
  static create(quoteContext: QuoteContext): State {
    switch (quoteContext.getQuoteItemEntity().status) {
      case QIStatus.Initializing:
        return new InitializingState(quoteContext);
      case QIStatus.Selecting:
        return new SelectingState(quoteContext);
      case QIStatus.Filling:
        return new FillingState(quoteContext);
      case QIStatus.Done:
        return new DoneState(quoteContext);
      default:
        throw new Error("undefined State enum");
    }
  }
}

export abstract class State {
  public quote: QuoteContext;
  constructor(quote: QuoteContext) {
    this.quote = quote;
    // switch (this.quote.getUserIntention()) {
    //   case Intention.Cancel:
    //     break;
    //   case Intention.Complete:
    //     break;
    //   default:
    //     console.log("Ninguna accion ejecutada");
    // }
  }
  activate(): void {
    this.quote.setStateDirect(this);
    // await this.enter();
  }
  async enter(): Promise<void> {
    /* opcional override */
  }
  abstract initializing(): void;
  abstract selecting(): void;
  abstract filling(): void;
  abstract done(): void;
}

export class UndefinedState extends State {
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

export class DoneState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
  }
  async enter(): Promise<void> {
    await this.quoteItemCompleted();
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
  async quoteItemCompleted(): Promise<void> {
    //Los calculos se hacen cuando se hace complete de quote
    //Creamos quote con estado "Initializing"
    try {
      console.log("quoteItem completado.");
      this.quote.setQuoteItemEntity(await this.quote.createEmptyQuoteItem());
      this.quote.changeState(new InitializingState(this.quote));
    } catch (error) {
      console.log("Error in quoteItemCompleted", error);
    }
  }
}
export class SelectingState extends State {
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
      this.quote.changeState(new DoneState(this.quote));
    } else {
      console.log("Faltan por completar los siguientes parameter");
      this.quote.changeState(new FillingState(this.quote));
    }
  }
  async done(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export class InitializingState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
  }
  async enter(): Promise<void> {
    // solo ejecutar si aplica
    if (this.quote.getQuoteEntity().status === "Pending") {
      await this.initializing();
    }
  }
  async initializing(): Promise<void> {
    //Enviar un mensaje de bienvenida
    console.log("Este es un mensaje de bienvenida");
    //Despues enviar lista de productos
    console.log(await this.quote.showProducts());

    this.quote.setQuoteItemStatus("Selecting");
    this.quote.setQuoteStatus("Pending");

    await this.quote.changeState(new SelectingState(this.quote));
  }
  selecting(): void {}
  filling(): void {
    throw new Error("Method not implemented.");
  }
  done(): void {
    throw new Error("Method not implemented.");
  }
}

export class FillingState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
  }

  async enter(): Promise<void> {
    /* opcional */
  }
  async initializing(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async filling(): Promise<void> {
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
  async selecting(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async done(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
export class CanceledState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
  }
  async enter(): Promise<void> {
    /* nada */
  }
  async initializing(): Promise<void> {
    /* nada */
  }
  async filling(): Promise<void> {
    /* nada */
  }
  async selecting(): Promise<void> {
    /* nada */
  }
  async done(): Promise<void> {
    const quoteUpdated = await this.quote.cancelQuote();
    const quoteItemUpdated = await this.quote.cancelQuoteItem();
    const nextState = new InitializingState(this.quote);
    nextState.quote.setResponseMessage("Mensaje generado");
    nextState.quote.setQuoteEntity(quoteUpdated);
    nextState.quote.setQuoteItemEntity(quoteItemUpdated);
    await this.quote.changeState(nextState);
  }
}
