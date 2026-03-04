export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export interface UserProps {
  id?: string;
  companyId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt?: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  public static create(props: UserProps): User {
    return new User({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get companyId(): string {
    return this.props.companyId;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): Role {
    return this.props.role;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
}
