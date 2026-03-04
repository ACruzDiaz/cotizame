import jwt from 'jsonwebtoken';
import { IJwtService } from '../../domain/interfaces/services/IJwtService';

export class JwtService implements IJwtService {
  private readonly accessSecret = process.env.JWT_ACCESS_SECRET || 'access-secret';
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

  public generateAccessToken(payload: any): string {
    return jwt.sign(payload, this.accessSecret, { expiresIn: '15m' });
  }

  public generateRefreshToken(payload: any): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: '7d' });
  }

  public verifyAccessToken(token: string): any {
    return jwt.verify(token, this.accessSecret);
  }

  public verifyRefreshToken(token: string): any {
    return jwt.verify(token, this.refreshSecret);
  }
}
