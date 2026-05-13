import { QIStatus } from "../../../generated/prisma/enums";
import { QuoteContext } from "./contextMachine";
import { Intention } from "../state.types";

export class StateFactory {
  private Constructor() {}
  static create(quoteContext: QuoteContext): State {
    let selectedState;
    switch (quoteContext.getQuoteItemEntity().status) {
      case QIStatus.Initializing:
        selectedState = new InitializingState(quoteContext);
        break;
      case QIStatus.Selecting:
        selectedState = new SelectingState(quoteContext);
        break;
      case QIStatus.Filling:
        selectedState = new FillingState(quoteContext);
        break;
      case QIStatus.Done:
        selectedState = new DoneState(quoteContext);
        break;
      default:
        throw new Error("undefined State enum");
    }
    selectedState.activate();
    return selectedState;
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
  async activate(): Promise<void> {
    this.quote.setStateDirect(this);
    await this.enter();
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
    //Los calculos de QUOTE se hacen cuando se complete quote
    //Creamos quote con estado "Initializing" para repetir el ciclo
    try {
      this.quote.setQuoteItemEntity(await this.quote.createEmptyQuoteItem());
      this.quote.changeState(new InitializingState(this.quote));
      console.log("quoteItem completado.");
    } catch (error) {
      console.log("Error in DoneState > quoteItemCompleted()", error);
    }
  }
}
export class SelectingState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
  }
  async enter(): Promise<void> {
    if (this.quote.getQuoteEntity().status === "Pending") {
      await this.selecting();
    }
  }
  initializing(): void {
    throw new Error("Method not implemented.");
  }
  filling(): void {
    throw new Error("Method not implemented.");
  }

  async selecting(): Promise<void> {
    try {
      await this.quote.updateQuoteItemProduct();
      console.log("Producto seleccionado correctamente");
    } catch (error) {
      console.log("Este mensaje va al usuario. Producto seleccionado invalido");
      throw error;
    }

    const paramsList = this.quote.getMissingParams();
    if (paramsList && paramsList.length == 0 && false) {
      //Situacion que no deberia pasar
      console.log("Parametros completos");
      this.quote.setQuoteItemStatus("Done");
      this.quote.setQuoteStatus("Pending");
      this.quote.changeState(new DoneState(this.quote));
    } else {
      this.quote.setQuoteItemStatus("Filling");
      this.quote.setQuoteStatus("Pending");
      this.quote.initializeQuoteItemParams();
      console.log("Faltan por completar los siguientes parameters:\n");
      //Añadir funcion que determina que parametros hacen falta
      console.log(this.quote.getMissingParams());
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
    if (this.quote.getQuoteEntity().status === "Pending") {
      await this.filling();
    }
  }
  initializing(): void {
    throw new Error("Method not implemented.");
  }
  async filling(): Promise<void> {
    const paramsList = this.quote.getMissingParams();
    if (paramsList && paramsList.length == 0 && false) {
      console.log("Parametros completos");
      this.quote.setQuoteItemStatus("Done");
      this.quote.changeState(new DoneState(this.quote));
    } else {
      this.quote.setQuoteItemStatus("Filling");
      this.quote.setQuoteStatus("Pending");
      console.log("Faltan por completar los siguientes parameters:\n");
      //Añadir funcion que determina que parametros hacen falta
      console.log(this.quote.getMissingParams());
      console.log(this.quote.getQuoteItemEntity());
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
export class CanceledState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
  }
  async enter(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async initializing(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async filling(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async selecting(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async done(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
