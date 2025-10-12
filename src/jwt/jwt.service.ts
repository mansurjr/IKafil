import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService as NestJwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserRole, users } from "@prisma/client";

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface JwtPayloadWithRefreshToken extends JwtPayload {
  refreshToken: string;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly jwt: NestJwtService,
    private readonly configService: ConfigService
  ) {}

  async generateTokens(user: users) {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email!,
      role: user.role,
      isActive: user.is_active!,
    };

    const accessSecret = this.configService.get<string>("ACCESS_SECRET");
    const refreshSecret = this.configService.get<string>("REFRESH_SECRET");
    const accessTime = this.configService.get<string>("ACCESS_TIME") || "15m";
    const refreshTime = this.configService.get<string>("REFRESH_TIME") || "7d";

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessTime,
      }),
      this.jwt.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshTime,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string) {
    try {
      const secret = this.configService.get<string>("ACCESS_SECRET");
      return this.jwt.verify(token, { secret });
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }
  }

  verifyRefreshToken(token: string) {
    try {
      const secret = this.configService.get<string>("REFRESH_SECRET");
      return this.jwt.verify(token, { secret });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  decodeToken(token: string) {
    return this.jwt.decode(token);
  }
}
