import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";
import {
  JwtPayload,
  JwtPayloadWithRefreshToken,
  JwtService,
} from "../../jwt/jwt.service";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh"
) {
  constructor(private readonly tokensService: JwtService) {
    super({
      jwtFromRequest: (req: Request) => {
        console.log("REFRESH COOKIES =>", req.cookies);
        return req?.cookies?.refreshToken || null;
      },
      secretOrKey: process.env.REFRESH_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new UnauthorizedException("No refresh token found");
    }

    const valid = await this.tokensService.verifyRefreshToken(token);
    if (!valid) {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }

    return {
      ...payload,
      refreshToken: token,
    };
  }
}
