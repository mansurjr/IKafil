import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { JWT_Payoad } from "../../jwt/jwt.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("ACCESS_SECRET")!,
    });
  }

  async validate(payload: JWT_Payoad) {
    if (!payload || !payload.id) {
      throw new UnauthorizedException("Invalid token");
    }

    return { id: payload.id, email: payload.email, role: payload.role };
  }
}
