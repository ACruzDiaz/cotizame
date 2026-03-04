export enum Plan {
  FREE = 'FREE',
  PAID = 'PAID',
}

export interface CompanyProps {
  id?: string;
  name: string;
  phone: string;
  plan: Plan;
  createdAt?: Date;
}

export class Company {
  private constructor(private readonly props: CompanyProps) {}

  public static create(props: CompanyProps): Company {
    return new Company({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get phone(): string {
    return this.props.phone;
  }

  get plan(): Plan {
    return this.props.plan;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
}
