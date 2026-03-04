export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface QuoteItemProps {
  id?: string;
  quoteId?: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export class QuoteItem {
  private constructor(private readonly props: QuoteItemProps) {}

  public static create(props: QuoteItemProps): QuoteItem {
    return new QuoteItem(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get quoteId(): string | undefined {
    return this.props.quoteId;
  }

  get serviceId(): string {
    return this.props.serviceId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get total(): number {
    return this.props.total;
  }
}

export interface QuoteProps {
  id?: string;
  companyId: string;
  clientId: string;
  status: QuoteStatus;
  subtotal: number;
  tax: number;
  total: number;
  expiresAt: Date;
  createdAt?: Date;
  items: QuoteItem[];
}

export class Quote {
  private constructor(private readonly props: QuoteProps) {}

  public static create(props: QuoteProps): Quote {
    return new Quote({
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

  get clientId(): string {
    return this.props.clientId;
  }

  get status(): QuoteStatus {
    return this.props.status;
  }

  get subtotal(): number {
    return this.props.subtotal;
  }

  get tax(): number {
    return this.props.tax;
  }

  get total(): number {
    return this.props.total;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get items(): QuoteItem[] {
    return this.props.items;
  }

  public approve(): void {
    if (this.props.status !== QuoteStatus.SENT) {
      throw new Error('Only SENT quotes can be approved');
    }
    (this.props as any).status = QuoteStatus.APPROVED;
  }

  public reject(): void {
    if (this.props.status !== QuoteStatus.SENT) {
      throw new Error('Only SENT quotes can be rejected');
    }
    (this.props as any).status = QuoteStatus.REJECTED;
  }
}
