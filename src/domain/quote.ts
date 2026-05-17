import { QIStatus, QuoteStatus } from "../generated/prisma/enums";
import { validate as validateUUID, v4 as uuidv4 } from "uuid";
import {
  QuoteItem,
  type QuoteItemCreateProps,
  type QuoteItemPersistenceProps,
} from "./quoteItem";
type Props = {
  id: string;
  companyId: string;
  clientId: string;
  status: QuoteStatus;
  totalAmount: number | null;
  pdfUrl: string | null;
  items: QuoteItem[];
  createdAt: Date;
};
type CreateProps = {
  companyId: string;
  clientId: string;
};

type FromPersistanceProps = {
  id: string;
  companyId: string;
  clientId: string;
  status: QuoteStatus;
  totalAmount: number | null;
  pdfUrl: string | null;
  items: QuoteItemPersistenceProps[];
  createdAt: Date;
};
export class Quote {
  private readonly _id: string;
  private _companyId: string;
  private _clientId: string;
  private _status: QuoteStatus;
  private _totalAmount: number | null;
  private _pdfUrl: string | null;
  private readonly _items: QuoteItem[];
  private readonly _createdAt: Date;

  private static readonly transitions: Record<QuoteStatus, QuoteStatus[]> = {
    [QuoteStatus.Pending]: [QuoteStatus.Canceled, QuoteStatus.Complete],
    [QuoteStatus.Canceled]: [],
    [QuoteStatus.Complete]: [],
  };
  private constructor(props: Props) {
    this._id = props.id;
    this._companyId = props.companyId;
    this._clientId = props.clientId;
    this._status = props.status;
    this._totalAmount = props.totalAmount;
    this._pdfUrl = props.pdfUrl;
    this._items = props.items;
    this._createdAt = props.createdAt;
  }

  static create(props: CreateProps) {
    Quote.ensureValidUUID(props.companyId, "CompanyID");
    Quote.ensureValidUUID(props.clientId, "ClientID");
    const full: Props = {
      id: uuidv4(),
      companyId: props.companyId,
      clientId: props.clientId,
      status: QuoteStatus.Pending,
      totalAmount: null,
      pdfUrl: null,
      items: [],
      createdAt: new Date(),
    };
    // full.items.push(
    //   QuoteItem.create(full.id, { parameters: undefined, productId: undefined })
    // );
    return new Quote(full);
  }

  static fromPersistence(props: FromPersistanceProps) {
    Quote.ensureValidUUID(props.id, "ID");
    if (props.totalAmount != null && props.totalAmount < 0)
      throw new Error("Total amoun cannot be negative");

    const items = props.items.map((item) => QuoteItem.fromPersistence(item));

    const full: Props = {
      id: props.id,
      companyId: props.companyId,
      clientId: props.clientId,
      status: props.status,
      totalAmount: props.totalAmount,
      pdfUrl: props.pdfUrl,
      items: items,
      createdAt: props.createdAt,
    };
    return new Quote(full);
  }

  /* =========================================================
     ITEM MANAGEMENT
  ========================================================= */

  addItem(props: QuoteItemCreateProps): QuoteItem {
    this.ensureMutable();
    const currentQuoteItem = this.findMutableItem();
    if (currentQuoteItem) {
      throw new Error(
        "You have incomplete quoteItems that need to be completed first"
      );
    }
    const item = QuoteItem.create(this._id, props);

    this._items.push(item);

    return item;
  }

  removeItem(itemId: string): void {
    this.ensureMutable();

    this._items.splice(
      this._items.findIndex((x) => x.id === itemId),
      1
    );
  }

  findItem(): QuoteItem | null {
    return this._items.reduce((prev, curr) =>
      curr.createdAt.getTime() > prev.createdAt.getTime() ? curr : prev
    );
  }
  private findMutableItem(): QuoteItem | null {
    const item = this._items.find(
      (x) => x.status !== QIStatus.Canceled && x.status !== QIStatus.Done
    );
    return item ?? null;
  }

  //Mientras solamente sera un texto que se responde al finalizar el quote
  setPdfUrl(url: string): void {
    this.ensureMutable();
    this._pdfUrl = url;
  }

  setCalculatedTotalAmount(): void {
    this.ensureMutable();

    const incompleteItems = this._items.some(
      (item) => item.status !== QIStatus.Done
    );

    if (incompleteItems) {
      throw new Error("Cannot calculate total with incomplete items");
    }

    this._totalAmount = this._items.reduce(
      (acc, item) => acc + (item.calculatedPrice ?? 0),
      0
    );
  }

  //====Domain ACtions====================

  complete(): void {
    this.setCalculatedTotalAmount();
    this.transitionTo(QuoteStatus.Complete);
  }

  cancel(): void {
    for (const item of this._items) {
      item.cancel();
    }
    this.transitionTo(QuoteStatus.Canceled);
  }

  //====FSM===========================================

  private transitionTo(nextState: QuoteStatus): void {
    const allowed = Quote.transitions[this._status];

    if (!allowed.includes(nextState)) {
      throw new Error(`Invalid transition ${this._status} -> ${nextState}`);
    }

    this.validateTransitionRequirements(nextState);
    this._status = nextState;
  }

  private validateTransitionRequirements(next: QuoteStatus): void {
    switch (next) {
      case QuoteStatus.Complete:
        this.ensureCanBeCompleted();
        break;
    }
  }

  private ensureCanBeCompleted(): void {
    if (this._items.length === 0) {
      throw new Error("Cannot complete quote without items");
    }

    const incompleteItems = this._items.some(
      (item) => item.status !== QIStatus.Done
    );

    if (incompleteItems) {
      throw new Error("All quote items must be completed");
    }
    if(this._totalAmount === null)
      throw new Error("Total amount mmust be set");


    if (this._totalAmount !== null && this._totalAmount < 0)
      throw new Error("Total amoun cannot be negative");

    if (!this._pdfUrl) throw new Error("A pdf url has to be generated before");
  }
  //=====Helpers=====================================
  private static ensureValidUUID(value: string, field: string): void {
    if (!validateUUID(value)) {
      throw new Error(`Invalid UUID ${field}`);
    }
  }

  private isTerminalState(): boolean {
    if (
      this._status === QuoteStatus.Canceled ||
      this._status === QuoteStatus.Complete
    )
      return true;
    else return false;
  }
  private ensureMutable(): void {
    if (this.isTerminalState()) {
      throw new Error("Current state does not allow modifications");
    }
  }

  getLastItem(): QuoteItem | null {
    return this._items.length > 0 ? this._items[this._items.length - 1]! : null;
  }
  //====Getters =======================================

  get id(): string {
    return this._id;
  }
  get companyId(): string {
    return this._companyId;
  }
  get clientId(): string {
    return this._clientId;
  }

  get status(): QuoteStatus {
    return this._status;
  }
  get totalAmount(): number | null {
    return this._totalAmount;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get pdfUrl(): string | null {
    return this._pdfUrl;
  }
  get items(): QuoteItem[] {
    return [...this._items];
  }
}
