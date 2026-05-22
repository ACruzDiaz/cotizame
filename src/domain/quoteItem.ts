import { QIStatus } from "../generated/prisma/enums.js";
import { validate as validateUUID, v4 as uuidv4 } from "uuid";
import type { ProductParams, QuoteItemParams } from "./types/domain.types.js";
import { ItemPriceCalculator } from "./service/itemPriceCalculator.js";
import type { Product } from "./product.js";
import logger from "../application/connection/logger.dev.js";

export type QuoteItemProps = {
  id: string;
  quoteId: string;
  productId: string | null;
  parameters: QuoteItemParams | null;
  status: QIStatus;
  calculatedPrice: number | null;
  createdAt: Date;
  isParamsCompleted: boolean;
};
export type QuoteItemCreateProps = {
  productId: string | undefined;
  parameters: QuoteItemParams | undefined;
};

export type QuoteItemPersistenceProps = {
  id: string;
  quoteId: string;
  productId: string | null;
  parameters: QuoteItemParams | null;
  status: QIStatus;
  calculatedPrice: number | null;
  createdAt: Date;
  isParamsCompleted: boolean;
};

export class QuoteItem {
  private readonly _id: string;
  private readonly _quoteId: string;
  private _productId: string | null;
  private _parameters: QuoteItemParams | null;
  private _status: QIStatus;
  private _calculatedPrice: number | null;
  private readonly _createdAt: Date;
  private _isParamsCompleted: boolean;

  private static readonly transitions: Record<QIStatus, QIStatus[]> = {
    [QIStatus.Initializing]: [QIStatus.Selecting, QIStatus.Canceled],
    [QIStatus.Selecting]: [QIStatus.Filling, QIStatus.Canceled],
    [QIStatus.Filling]: [QIStatus.Done, QIStatus.Canceled],
    [QIStatus.Done]: [],
    [QIStatus.Canceled]: [],
  };
  private constructor(props: QuoteItemProps) {
    this._id = props.id;
    this._quoteId = props.quoteId;
    this._productId = props.productId === undefined ? null : props.productId;
    this._parameters = structuredClone(props.parameters);
    this._status = props.status;
    this._calculatedPrice = props.calculatedPrice;
    this._createdAt = props.createdAt;
    this._isParamsCompleted = props.isParamsCompleted;
  }

  static create(quoteId: string, props: QuoteItemCreateProps): QuoteItem {
    this.ensureValidUUID(quoteId, "QuoteID");

    if (props.productId) {
      this.ensureValidUUID(props.productId, "ProductID");
    }

    const full: QuoteItemProps = {
      id: uuidv4(),
      quoteId: quoteId,
      productId: props.productId === undefined ? null : props.productId,
      parameters: props.parameters === undefined ? null : props.parameters,
      status: QIStatus.Initializing,
      calculatedPrice: null,
      createdAt: new Date(),
      isParamsCompleted: false,
    };
    logger.debug("Quote item 'create' static method")
    return new QuoteItem(full);
  }

  static fromPersistence(props: QuoteItemPersistenceProps): QuoteItem {
    this.ensureValidUUID(props.id, "ID");
    this.ensureValidUUID(props.quoteId, "QuoteID");
    if (props.productId) {
      this.ensureValidUUID(props.productId, "ProductID");
    }
    if (props.calculatedPrice !== null && props.calculatedPrice < 0)
      throw new Error("CalculatedPrice cannot be less than 0");

    const full: QuoteItemProps = {
      id: props.id,
      quoteId: props.quoteId,
      productId: props.productId === undefined ? null : props.productId,
      parameters: props.parameters,
      status: props.status,
      calculatedPrice:
        props.calculatedPrice === undefined ? null : props.calculatedPrice,
      createdAt: props.createdAt,
      isParamsCompleted: props.isParamsCompleted,
    };
    logger.debug("Quote Item 'fromPersistence' static method")
    return new QuoteItem(full);
  }

  /*
   * @deprecated
   * Use intented only for internal use and test
   */
  _setPrice(price: number): void {
    this.ensureMutable();

    if (price < 0) {
      throw new Error("CalculatedPrice cannot be less than 0");
    }

    if (!this._isParamsCompleted) {
      throw new Error("Cannot calculate price with incomplete params");
    }

    if (!this._productId) {
      throw new Error("Cannot calculate price without product");
    }

    this._calculatedPrice = price;

    this.transitionTo(QIStatus.Done);
  }

  /*
   * @deprecated
   * Use intented only for internal use and test
   */
  _markParamsCompleted(): void {
    this.ensureMutable();
    if (!validateUUID(this._productId))
      throw new Error("Product ID must be a valid UUID");

    this._isParamsCompleted = true;
  }

  assignProduct(productId: string, productParams: ProductParams): void {
    this.ensureMutable();
    QuoteItem.ensureValidUUID(productId, "ProductID");

    this._productId = productId;
    this._parameters = this.initNullParams(productParams);
    logger.debug(`The product ${this._productId} has been set to quote Item: ${this._id} in memory`)

    this.transitionTo(QIStatus.Filling);
  }

  private initNullParams(productParams: ProductParams): Record<string, null> {
    return Object.fromEntries(
      Object.keys(productParams).map((key) => [key, null]),
    );
  }

  addParams(newParams: QuoteItemParams, product: Product): void {
    if (this._parameters === null)
      throw new Error("Can not add params keys does not exist nor product");
    this.ensureMutable();

    const current = this.asPlainObject(this._parameters);
    const incoming = this.asPlainObject(newParams);

    this._parameters = {
      ...current,
      ...incoming,
    };
    const areParamsCompleted = this.areParamsCompleted(
      this._parameters,
      product.parameters,
    );
    if (areParamsCompleted) {
      this._markParamsCompleted();
      this._setPrice(ItemPriceCalculator.calculateItemPrice(this, product));
    }
    logger.debug(`The quote Item isParamsComplete is: ${this._isParamsCompleted} in memory`)
  }

  //====Domain Actions====================

  startSelecting(): void {
    this.transitionTo(QIStatus.Selecting);
  }

  private startFilling(): void {
    this.transitionTo(QIStatus.Filling);
  }
  //TODO: Check if this method is needed to be public
  private complete(): void {
    this.transitionTo(QIStatus.Done);
  }

  cancel(): void {
    this.transitionTo(QIStatus.Canceled);
  }

  //====FSM===========================================

  private transitionTo(next: QIStatus): void {
    const allowed = QuoteItem.transitions[this._status];

    if (!allowed.includes(next)) {
      throw new Error(`Invalid transition ${this._status} -> ${next}`);
    }

    this.validateTransitionRequirements(next);

    this._status = next;
  }

  private validateTransitionRequirements(next: QIStatus): void {
    switch (next) {
      case QIStatus.Done:
        this.ensureCanBeCompleted();
        break;

      case QIStatus.Filling:
        this.ensureCanStartFilling();
        break;
    }
  }

  private ensureCanStartFilling(): void {
    if (!this._productId) {
      throw new Error("Cannot start filling without selected product");
    }
  }

  private ensureCanBeCompleted(): void {
    if (!this._productId) {
      throw new Error("Cannot complete without product");
    }

    if (!this._isParamsCompleted) {
      throw new Error("Cannot complete with incomplete params");
    }

    if (this._calculatedPrice === null) {
      throw new Error("Cannot complete without calculated price");
    }
  }

  //====Helpers=======================================

  private ensureMutable(): void {
    if (this.isTerminalState()) {
      throw new Error("Current state does not allow modifications");
    }
  }
  isTerminalState(): boolean {
    if (this._status === QIStatus.Canceled || this._status === QIStatus.Done)
      return true;
    else return false;
  }

  private asPlainObject(value: QuoteItemParams): QuoteItemParams {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }

    return {};
  }

  private static ensureValidUUID(value: string, field: string): void {
    if (!validateUUID(value)) {
      throw new Error(`Invalid UUID ${field}`);
    }
  }

  private areParamsCompleted(
    current: QuoteItemParams,
    base: ProductParams,
  ): boolean {
    const currentKeys = Object.keys(current);
    const baseKeys = Object.keys(base);

    // mismos keys
    if (
      currentKeys.length !== baseKeys.length ||
      !baseKeys.every((key) => key in current)
    ) {
      return false;
    }

    return baseKeys.every((key) => {
      const value = current[key];
      const expectedType = base[key];

      // null y undefined no son válidos
      if (value === null || value === undefined) {
        return false;
      }

      return typeof value === expectedType;
    });
  }

  //====Getters =======================================

  get id(): string {
    return this._id;
  }
  get quoteId(): string {
    return this._quoteId;
  }
  get productId(): string | null {
    return this._productId;
  }
  get parameters(): QuoteItemParams | null {
    return structuredClone(this._parameters);
  }
  get status(): QIStatus {
    return this._status;
  }
  get calculatedPrice(): number | null {
    return this._calculatedPrice;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get isParamsCompleted(): boolean {
    return this._isParamsCompleted;
  }
}
