export interface ServiceProps {
  id?: string;
  companyId: string;
  name: string;
  description?: string;
  basePrice: number;
  taxRate: number;
  createdAt?: Date;
}

export class Service {
  private constructor(private readonly props: ServiceProps) {}

  public static create(props: ServiceProps): Service {
    return new Service({
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

  get description(): string | undefined {
    return this.props.description;
  }

  get basePrice(): number {
    return this.props.basePrice;
  }

  get taxRate(): number {
    return this.props.taxRate;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
}
