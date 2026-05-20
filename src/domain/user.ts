import  { UserRole } from "../generated/prisma/enums.js";
import { v4 as uuidv4 } from "uuid";

export type UserProps = {
  id: string;
  companyId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
};

export type UserCreateProps = {
  companyId: string;
  email: string;
  passwordHash: string;
  role: UserRole | undefined;
};

export type UserFromPersistenceProps = {
  id: string;
  companyId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
};

export class User {
  private readonly _id: string;
  private readonly _companyId: string;
  private readonly _email: string;
  private readonly _passwordHash: string;
  private  _role: UserRole;
  private readonly _createdAt: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._companyId = props.companyId;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._role = props.role;
    this._createdAt = props.createdAt;
  }

  static create(props: UserCreateProps) {
    const full: UserProps = {
      id: uuidv4(),
      companyId: props.companyId,
      email: props.email,
      passwordHash: props.passwordHash,
      role: props.role === undefined ? UserRole.ADMIN : props.role,
      createdAt: new Date(),
    };

    return new User(full);
  }

  static fromPersistence(props: UserFromPersistenceProps) {
    const full: UserProps = {
      id: props.id,
      companyId: props.companyId,
      email: props.email,
      passwordHash: props.passwordHash,
      role: props.role,
      createdAt: props.createdAt,
    };

    return new User(full);
  }

  get id(): string {
    return this._id;
  }

  get companyId(): string {
    return this._companyId;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get role(): UserRole {
    return this._role;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
