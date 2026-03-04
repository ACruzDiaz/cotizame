import { Request, Response, NextFunction } from 'express';
import { IJwtService } from '../../../domain/interfaces/services/IJwtService';
import { AppError } from './ErrorHandler';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    companyId: string;
    role: string;
  };
}

export class AuthMiddleware {
  constructor(private jwtService: IJwtService) {}

  public handle = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new AppError('No token provided', 401));
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = this.jwtService.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      next(new AppError('Invalid token', 401));
    }
  };

  public roleRequired = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return next(new AppError('Forbidden: Access denied', 403));
      }
      next();
    };
  };
}
