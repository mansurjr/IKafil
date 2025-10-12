import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { JwtPayloadWithRefreshToken } from "../../jwt/jwt.service";

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayloadWithRefreshToken | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayloadWithRefreshToken;

    if (!user) {
      throw new ForbiddenException("Foydalanuvchi aniqlanmadi");
    }

    return data ? user[data] : user;
  }
);
