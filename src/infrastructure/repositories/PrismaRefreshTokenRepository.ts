import { PrismaClient } from '@prisma/client';
import { IRefreshTokenRepository } from '../../domain/interfaces/repositories/IRefreshTokenRepository';
import { RefreshToken } from '../../domain/entities/RefreshToken';

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private prisma: PrismaClient) {}

  public async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const created = await this.prisma.refreshToken.create({
      data: {
        id: refreshToken.id,
        userId: refreshToken.userId,
        token: refreshToken.token,
        expiresAt: refreshToken.expiresAt,
      },
    });

    return RefreshToken.create(created);
  }

  public async findByToken(token: string): Promise<RefreshToken | null> {
    const result = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!result) return null;

    return RefreshToken.create(result);
  }

  public async deleteByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  public async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
