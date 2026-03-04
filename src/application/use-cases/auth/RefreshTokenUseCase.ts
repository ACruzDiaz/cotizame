import { IRefreshTokenRepository } from '../../../domain/interfaces/repositories/IRefreshTokenRepository';
import { IJwtService } from '../../../domain/interfaces/services/IJwtService';
import { RefreshToken } from '../../../domain/entities/RefreshToken';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private refreshTokenRepository: IRefreshTokenRepository,
    private jwtService: IJwtService,
  ) {}

  public async execute(input: RefreshTokenInput): Promise<RefreshTokenResponse> {
    const existingToken = await this.refreshTokenRepository.findByToken(input.refreshToken);
    if (!existingToken || existingToken.isExpired()) {
      if (existingToken) {
        await this.refreshTokenRepository.deleteByToken(input.refreshToken);
      }
      throw new Error('Invalid or expired refresh token');
    }

    let payload: any;
    try {
      payload = this.jwtService.verifyRefreshToken(input.refreshToken);
    } catch (error) {
      await this.refreshTokenRepository.deleteByToken(input.refreshToken);
      throw new Error('Invalid refresh token');
    }

    // Generate new pair (Refresh Token Rotation)
    const newPayload = {
      userId: payload.userId,
      companyId: payload.companyId,
      role: payload.role,
    };

    const newAccessToken = this.jwtService.generateAccessToken(newPayload);
    const newRefreshTokenValue = this.jwtService.generateRefreshToken(newPayload);

    // Replace old token with new one
    await this.refreshTokenRepository.deleteByToken(input.refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newRefreshTokenEntity = RefreshToken.create({
      userId: payload.userId,
      token: newRefreshTokenValue,
      expiresAt: expiresAt,
    });

    await this.refreshTokenRepository.create(newRefreshTokenEntity);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenValue,
    };
  }
}
