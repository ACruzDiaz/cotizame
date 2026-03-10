"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const ErrorHandler_1 = require("./ErrorHandler");
class AuthMiddleware {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    handle = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(new ErrorHandler_1.AppError('No token provided', 401));
        }
        const [, token] = authHeader.split(' ');
        try {
            const decoded = this.jwtService.verifyAccessToken(token);
            req.user = decoded;
            next();
        }
        catch (error) {
            next(new ErrorHandler_1.AppError('Invalid token', 401));
        }
    };
    roleRequired = (roles) => {
        return (req, res, next) => {
            if (!req.user || !roles.includes(req.user.role)) {
                return next(new ErrorHandler_1.AppError('Forbidden: Access denied', 403));
            }
            next();
        };
    };
}
exports.AuthMiddleware = AuthMiddleware;
