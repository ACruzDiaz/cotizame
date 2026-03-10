"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenUseCase = void 0;
const RefreshToken_1 = require("../../../domain/entities/RefreshToken");
class RefreshTokenUseCase {
    refreshTokenRepository;
    jwtService;
    constructor(refreshTokenRepository, jwtService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
    }
    async execute(input) {
        const existingToken = await this.refreshTokenRepository.findByToken(input.refreshToken);
        if (!existingToken || existingToken.isExpired()) {
            if (existingToken) {
                await this.refreshTokenRepository.deleteByToken(input.refreshToken);
            }
            throw new Error('Invalid or expired refresh token');
        }
        let payload;
        try {
            payload = this.jwtService.verifyRefreshToken(input.refreshToken);
        }
        catch (error) {
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
        const newRefreshTokenEntity = RefreshToken_1.RefreshToken.create({
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
exports.RefreshTokenUseCase = RefreshTokenUseCase;
