"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaRefreshTokenRepository = void 0;
const RefreshToken_1 = require("../../domain/entities/RefreshToken");
class PrismaRefreshTokenRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(refreshToken) {
        const created = await this.prisma.refreshToken.create({
            data: {
                id: refreshToken.id,
                userId: refreshToken.userId,
                token: refreshToken.token,
                expiresAt: refreshToken.expiresAt,
            },
        });
        return RefreshToken_1.RefreshToken.create(created);
    }
    async findByToken(token) {
        const result = await this.prisma.refreshToken.findUnique({
            where: { token },
        });
        if (!result)
            return null;
        return RefreshToken_1.RefreshToken.create(result);
    }
    async deleteByToken(token) {
        await this.prisma.refreshToken.delete({
            where: { token },
        });
    }
    async deleteByUserId(userId) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }
}
exports.PrismaRefreshTokenRepository = PrismaRefreshTokenRepository;
