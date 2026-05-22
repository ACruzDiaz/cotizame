import type { CompanyTier } from "../generated/prisma/enums.js";
import {  v4 as uuidv4 } from "uuid";
import logger from "../application/connection/logger.dev.js";
export type CompanyProps = {
  id: string;
  phoneNumber: string;
  name: string;
  website: string | null;
  tier: CompanyTier;
  createdAt: Date;
  updatedAt: Date;
};

export type CompanyCreateProps = {
  phoneNumber: string;
  name: string;
  tier: CompanyTier;
  website: string | undefined;
};

export type CompanyFromPersistenceProps = {
  id: string;
  phoneNumber: string;
  name: string;
  website: string | null;
  tier: CompanyTier;
  createdAt: Date;
  updatedAt: Date;
};
export class Company {
  private readonly _id: string;
  private _phoneNumber: string;
  private _name: string;
  private _website: string | null;
  private _tier: CompanyTier;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: CompanyProps) {
    this._id = props.id;
    this._phoneNumber = props.phoneNumber;
    this._name = props.name;
    this._website = props.website;
    this._tier = props.tier;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CompanyCreateProps) {
    const full: CompanyProps = {
      id: uuidv4(),
      phoneNumber: props.phoneNumber,
      name: props.name,
      tier: props.tier,
      website: props.website === undefined ? null : props.website,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    logger.debug("Company from 'create' static method");
    return new Company(full);
  }

  static fromPersistence(props: CompanyFromPersistenceProps) {
    const full: CompanyProps = {
      id: props.id,
      phoneNumber: props.phoneNumber,
      name: props.name,
      tier: props.tier,
      website: props.website === undefined ? null : props.website,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
    logger.debug("Company from 'fromPersistence' static method");
    return new Company(full);
  }

  //===== getters ==========================
  get id(): string {
    return this._id;
  }

  get phoneNumber(): string {
    return this._phoneNumber;
  }

  get name(): string {
    return this._name;
  }
  get website(): string | null {
    return this._website;
  }
  get tier(): CompanyTier {
    return this._tier;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
