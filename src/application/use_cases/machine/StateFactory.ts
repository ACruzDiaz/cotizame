import { QIStatus } from "../../../generated/prisma/enums";
import { QuoteContext } from "./contextMachine";

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

export class State {
  public quote: QuoteContext;
  constructor(quote: QuoteContext) {
    this.quote = quote;
    // subclasses may inspect intention in their enter() implementations
  }
  async activate(): Promise<void> {
    this.quote.setStateDirect(this);
    await this.enter();
  }
  // default enter is a no-op; subclasses may override
  async enter(): Promise<void> {}

  async initializing(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async selecting(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async filling(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async done(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export class UndefinedState extends State {}

export class DoneState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
  }
  async enter(): Promise<void> {
    await this.quoteItemCompleted();
  }
  async quoteItemCompleted(): Promise<void> {
    //Los calculos de QUOTE se hacen cuando se complete quote
    //Creamos quote con estado "Initializing" para repetir el ciclo
    try {
      // Enqueue creation of an empty QuoteItem and then transition.
      this.quote.enqueueCreateEmptyQuoteItem();
      await this.quote.changeState(new InitializingState(this.quote));
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
  async selecting(): Promise<void> {
    try {
      // Request update of the quote item product; persistence is executed centrally
      this.quote.enqueueUpdateQuoteItemProduct();
      console.log("Producto seleccionado (enqueued)");
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
      await this.quote.changeState(new DoneState(this.quote));
    } else {
      this.quote.setQuoteItemStatus("Filling");
      this.quote.setQuoteStatus("Pending");
      this.quote.initializeQuoteItemParams();
      console.log("Faltan por completar los siguientes parameters:\n");
      //Añadir funcion que determina que parametros hacen falta
      console.log(this.quote.getMissingParams());
      await this.quote.changeState(new FillingState(this.quote));
    }
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
    // Request product list; persistence/read will be executed before entering next state
    this.quote.enqueueShowProducts();

    this.quote.setQuoteItemStatus("Selecting");
    this.quote.setQuoteStatus("Pending");

    await this.quote.changeState(new SelectingState(this.quote));
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
  async filling(): Promise<void> {
    this.quote.setReceivedParams();
    const paramsList = this.quote.getMissingParams();
    if (paramsList && paramsList.length == 0) {
      console.log("Parametros completos");
      this.quote.setQuoteItemStatus("Done");
      await this.quote.changeState(new DoneState(this.quote));
    } else {
      this.quote.setQuoteItemStatus("Filling");
      this.quote.setQuoteStatus("Pending");
      console.log("Faltan por completar los siguientes parameters:\n");
      //Añadir funcion que determina que parametros hacen falta
      console.log(this.quote.getMissingParams());
      console.log(this.quote.getQuoteItemEntity());
      await this.quote.changeState(new FillingState(this.quote));
    }
  }
}
export class CanceledState extends State {
  constructor(quote: QuoteContext) {
    super(quote);
  }
}
