export interface RefreshTokenProps {
  id?: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
}

export class RefreshToken {
  private constructor(private readonly props: RefreshTokenProps) {}

  public static create(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken({
      ...props,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get token(): string {
    return this.props.token;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  public isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }
}
