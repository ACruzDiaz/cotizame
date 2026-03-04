import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/interfaces/repositories/IRefreshTokenRepository';
import { IPasswordHasher } from '../../../domain/interfaces/services/IPasswordHasher';
import { IJwtService } from '../../../domain/interfaces/services/IJwtService';
import { RefreshToken } from '../../../domain/entities/RefreshToken';

export interface LoginRequest {
  email: string;
  passwordHash: string; // The UI sends password, but name it clearer if needed, though use case receives raw password
}

// Actually let's rename to password
export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId: string;
  };
}

export class LoginUser {
  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
    private passwordHasher: IPasswordHasher,
    private jwtService: IJwtService,
  ) {}

  public async execute(input: LoginInput): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      userId: user.id!,
      companyId: user.companyId,
      role: user.role,
    };

    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshTokenValue = this.jwtService.generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshTokenEntity = RefreshToken.create({
      userId: user.id!,
      token: refreshTokenValue,
      expiresAt: expiresAt,
    });

    await this.refreshTokenRepository.create(refreshTokenEntity);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }
}
