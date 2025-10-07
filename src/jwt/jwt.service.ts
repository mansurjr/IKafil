import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService as NestJwtService } from "@nestjs/jwt";
import { UserRole, users } from "@prisma/client";

export interface JWT_Payoad {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
}

@Injectable()
export class JwtService {
  constructor(private readonly jwt: NestJwtService) {}

  async generateTokens(user: users) {
    const payload:JWT_Payoad = {
      id: user.id,
      email: user.email!,
      role: user.role,
      isActive: user.is_active!,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: process.env.ACCESS_SECRET,
        expiresIn: process.env.ACCESS_TIME || "15m",
      }),
      this.jwt.signAsync(payload, {
        secret: process.env.REFRESH_SECRET,
        expiresIn: process.env.REFRESH_TIME || "7d",
      }),
    ]);

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string) {
    try {
      return this.jwt.verify(token, { secret: process.env.ACCESS_SECRET });
    } catch (err) {
      throw new UnauthorizedException("Invalid access token");
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return this.jwt.verify(token, { secret: process.env.REFRESH_SECRET });
    } catch (err) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
  decodeToken(token: string) {
    return this.jwt.decode(token);
  }
}
