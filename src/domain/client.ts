import { v4 as uuidv4 } from "uuid";
import logger  from "../application/connection/logger.dev.js";
export type ClientProps = {
  id: string;
  companyId: string;
  clientPhone: string;
  name: string | null;
  registeredAt: Date;
};

export type ClientCreateProps = {
  companyId: string;
  clientPhone: string;
  name?: string;
};

export type ClientFromPersistenceProps = {
  id: string;
  companyId: string;
  clientPhone: string;
  name: string | null;
  registeredAt: Date;
};

export class Client {
  private readonly _id: string;
  private _companyId: string;
  private _clientPhone: string;
  private _name: string | null;
  private readonly _registeredAt: Date;

  constructor(props: ClientProps) {
    this._id = props.id;
    this._companyId = props.companyId;
    this._clientPhone = props.clientPhone;
    this._name = props.name;
    this._registeredAt = props.registeredAt;
  }

  static create(props: ClientCreateProps) {
    const full: ClientProps = {
      id: uuidv4(),
      companyId: props.companyId,
      clientPhone: props.clientPhone,
      name: props.name === undefined ? null : props.name,
      registeredAt: new Date(),
    };
    logger.debug("Client from 'create' static method")
    return new Client(full);
  }

  static fromPersistence(props: ClientFromPersistenceProps) {
    const full: ClientProps = {
      id: props.id,
      companyId: props.companyId,
      clientPhone: props.clientPhone,
      name: props.name === undefined ? null : props.name,
      registeredAt: props.registeredAt,
    };
    logger.debug("Client from 'persistence' static method")
    return new Client(full);
  }

  get id(): string {
    return this._id;
  }

  get companyId(): string {
    return this._companyId;
  }

  get clientPhone(): string {
    return this._clientPhone;
  }

  get name(): string | null {
    return this._name;
  }

  get registeredAt(): Date {
    return this._registeredAt;
  }
}
