import type { DynamicPricingDsl } from "./engine/dsl.types.js";
import { v4 as uuidv4 } from "uuid";
import type { ProductParams } from "./types/domain.types.js";
import logger from "../application/connection/logger.dev.js";
export type ProductProps = {
  id: string;
  companyId: string;
  name: string;
  parameters: ProductParams;
  description: string;
  notes: string | null;
  basePrice: number;
  dynamicPricingDsl: DynamicPricingDsl;
  deletedAt: Date | null;
};

export type ProductCreateProps = {
  companyId: string;
  name: string;
  parameters: ProductParams;
  description: string;
  notes: string | undefined;
  basePrice: number;
  dynamicPricingDsl: DynamicPricingDsl;
  deletedAt: Date | undefined;
};

export type ProductPersistenceProps = {
  id: string;
  companyId: string;
  name: string;
  parameters: ProductParams;
  description: string;
  notes: string | null;
  basePrice: number;
  dynamicPricingDsl: DynamicPricingDsl;
  deletedAt: Date | null;
};

export class Product {
  private readonly _id: string;
  private readonly _companyId: string;
  private _name: string;
  private _parameters: ProductParams;
  private _description: string;
  private _notes: string | null;
  private _basePrice: number;
  private _dynamicPricingDsl: DynamicPricingDsl;
  private _deletedAt: Date | null;

  private constructor(props: ProductProps) {
    this._id = props.id;
    this._companyId = props.companyId;
    this._name = props.name;
    this._parameters = props.parameters;
    this._description = props.description;
    this._notes = props.notes;
    this._basePrice = props.basePrice;
    this._dynamicPricingDsl = props.dynamicPricingDsl;
    this._deletedAt = props.deletedAt;
  }

  static create(props: ProductCreateProps) {
    if (props.basePrice < 0) throw new Error("Base price can not be negative");

    const full: ProductProps = {
      id: uuidv4(),
      companyId: props.companyId,
      name: props.name,
      parameters: props.parameters,
      description: props.description,
      notes: props.notes === undefined ? null : props.notes,
      basePrice: props.basePrice,
      dynamicPricingDsl: props.dynamicPricingDsl,
      deletedAt: props.deletedAt === undefined ? null : props.deletedAt,
    };
    return new Product(full);
  }

  static fromPersistence(props: ProductPersistenceProps) {
    const full: ProductProps = {
      id: props.id,
      companyId: props.companyId,
      name: props.name,
      parameters: props.parameters,
      description: props.description,
      notes: props.notes,
      basePrice: props.basePrice,
      dynamicPricingDsl: props.dynamicPricingDsl,
      deletedAt: props.deletedAt,
    };
    return new Product(full);
  }

  //===== Domain Actions =======================

  deleteProduct() {
    this.ensureMutable();
    this._deletedAt = new Date();
    logger.debug("Product in memory deleted")
  }

  setNote(content: string) {
    this.ensureMutable();
    this._notes = content;
    logger.debug("Product's note set in memory")

  }

  //===== Helpers =============================
  private ensureMutable() {
    if (this._deletedAt !== null) {
      throw new Error("Note already deleted");
    }
  }

  //====== Getters =========================
  // Getters for all private properties
  get id(): string {
    return this._id;
  }

  get companyId(): string {
    return this._companyId;
  }

  get name(): string {
    return this._name;
  }

  get parameters(): ProductParams {
    return this._parameters;
  }

  get description(): string {
    return this._description;
  }

  get notes(): string | null {
    return this._notes;
  }

  get basePrice(): number {
    return this._basePrice;
  }

  get dynamicPricingDsl(): DynamicPricingDsl {
    return this._dynamicPricingDsl;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }
}
