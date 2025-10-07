import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "../jwt/jwt.service";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { Request, Response } from "express";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: CreateUserDto) {
    const existing = await this.usersService.findByEmailOrPhone(dto.email);
    if (existing) throw new BadRequestException("Email already registered");

    const user = await this.usersService.createUser({
      dto,
    });
    if (!user) throw new BadRequestException("Something went wrong");

    return { message: "User registered successfully", userId: user.id };
  }

  async signIn(dto: SignInDto, res: Response) {
    const user = await this.usersService.findByEmailOrPhone(dto.email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    const { accessToken, refreshToken } =
      await this.jwtService.generateTokens(user);
    await this.usersService.updateToken(user.id, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken };
  }

  // ------------- REFRESH ----------------
  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw new UnauthorizedException("No refresh token");

    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.id);
    if (!user || user.token !== refreshToken)
      throw new UnauthorizedException("Invalid refresh token");

    const tokens = await this.jwtService.generateTokens(user);
    await this.usersService.updateToken(user.id, tokens.refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: +process.env.COOKIE_TIME!,
    });
    return { accessToken: tokens.accessToken };
  }

  async signOut(req: Request, res: Response) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw new UnauthorizedException("Not logged in");

    const payload = this.jwtService.decodeToken(refreshToken);
    if (payload?.id) await this.usersService.updateToken(payload.id, null);

    res.clearCookie("refreshToken");
    return { message: "Signed out successfully" };
  }

  async me(userId: number) {
    if (!userId) throw new UnauthorizedException("Unauthorized");

    const user = await this.usersService.findById(userId);
    return user;
  }
}
