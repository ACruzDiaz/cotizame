"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUser = void 0;
const RefreshToken_1 = require("../../../domain/entities/RefreshToken");
class LoginUser {
    userRepository;
    refreshTokenRepository;
    passwordHasher;
    jwtService;
    constructor(userRepository, refreshTokenRepository, passwordHasher, jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordHasher = passwordHasher;
        this.jwtService = jwtService;
    }
    async execute(input) {
        const user = await this.userRepository.findByEmail(input.email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = await this.passwordHasher.compare(input.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        const payload = {
            userId: user.id,
            companyId: user.companyId,
            role: user.role,
        };
        const accessToken = this.jwtService.generateAccessToken(payload);
        const refreshTokenValue = this.jwtService.generateRefreshToken(payload);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        const refreshTokenEntity = RefreshToken_1.RefreshToken.create({
            userId: user.id,
            token: refreshTokenValue,
            expiresAt: expiresAt,
        });
        await this.refreshTokenRepository.create(refreshTokenEntity);
        return {
            accessToken,
            refreshToken: refreshTokenValue,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
            },
        };
    }
}
exports.LoginUser = LoginUser;
