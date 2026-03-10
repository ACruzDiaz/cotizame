"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtService {
    accessSecret = process.env.JWT_ACCESS_SECRET || 'access-secret';
    refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.accessSecret, { expiresIn: '15m' });
    }
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.refreshSecret, { expiresIn: '7d' });
    }
    verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, this.accessSecret);
    }
    verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, this.refreshSecret);
    }
}
exports.JwtService = JwtService;
