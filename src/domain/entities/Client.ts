export interface ClientProps {
  id?: string;
  companyId: string;
  name?: string;
  phone: string;
  email?: string;
  userId?: string;
  createdAt?: Date;
}

export class Client {
  private constructor(private readonly props: ClientProps) {}

  public static create(props: ClientProps): Client {
    return new Client({
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

  get name(): string | undefined {
    return this.props.name;
  }

  get phone(): string {
    return this.props.phone;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get userId(): string | undefined {
    return this.props.userId;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  public isRegistered(): boolean {
    return !!this.props.userId;
  }

  public register(userId: string): void {
    if (this.props.userId) {
      throw new Error('Client is already registered');
    }
    (this.props as any).userId = userId;
  }
}
