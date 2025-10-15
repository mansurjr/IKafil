import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Response } from "express";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { JwtService } from "../jwt/jwt.service";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "../users/dto/sign-in.dto";
import uuid from "uuid";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService
  ) {}

  async register(dto: Omit<CreateUserDto, "role">) {
    const existing = await this.usersService.findByEmailOrPhone(dto.email);
    if (existing) throw new BadRequestException("Email already registered");

    const activationLink = uuid.v4();
    await this.mail.sendMail(dto.email, activationLink);
    const user = await this.usersService.createUser(dto, activationLink);
    return { message: "User registered successfully", userId: user.id };
  }

  async activate(activationLink: string) {
    const user = await this.prisma.users.findFirst({
      where: { activation_link: activationLink },
    });
    if (!user) throw new BadRequestException("Invalid activation link");

    await this.prisma.users.update({
      where: { id: user.id },
      data: { is_active: true, activation_link: null },
    });
    return { message: "Account activated successfully" };
  }

  async signIn(dto: SignInDto, res: Response) {
    const user = await this.usersService.findByEmailOrPhone(dto.email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(dto.password, user.password!);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    if (!user.is_active)
      throw new ForbiddenException("Please activate your account first");

    const tokens = await this.jwtService.generateTokens(user);
    await this.usersService.updateToken(user.id, tokens.refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: this.config.get("NODE_ENV") === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  async sendOtp(emailOrPhone: string) {
    const user = await this.usersService.findByEmailOrPhone(emailOrPhone);
    if (!user) throw new NotFoundException("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 60 * 1000);

    await this.prisma.users.update({
      where: { id: user.id },
      data: { otp_code: otp, otp_expire: expires },
    });

    if (user.email) await this.mail.sendOtpMail(user.email, otp);
    return { message: "OTP sent successfully" };
  }

  async verifyOtp(emailOrPhone: string, otp: string, res: Response) {
    const user = await this.usersService.findByEmailOrPhone(emailOrPhone);
    if (!user) throw new BadRequestException("Invalid user");

    if (!user.otp_code || user.otp_code !== otp)
      throw new BadRequestException("Invalid OTP");

    if (user.otp_expire && user.otp_expire < new Date())
      throw new BadRequestException("OTP expired");

    await this.prisma.users.update({
      where: { id: user.id },
      data: { otp_code: null, otp_expire: null },
    });

    const tokens = await this.jwtService.generateTokens(user);
    await this.usersService.updateToken(user.id, tokens.refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: this.config.get("NODE_ENV") === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  async forgetPassword(email: string) {
    const user = await this.usersService.findByEmailOrPhone(email);
    if (!user) throw new BadRequestException("User not found");

    const token = uuid.v4();
    const resetLink = `${this.config.get("APP_URL")}/api/reset-password/${token}`;

    await this.prisma.users.update({
      where: { id: user.id },
      data: { resetLink: token },
    });

    await this.mail.sendResetPasswordMail(user, resetLink);
    return { message: "Password reset link sent to your email" };
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmNewPassword: string
  ) {
    if (newPassword !== confirmNewPassword)
      throw new BadRequestException("Passwords do not match");

    const user = await this.prisma.users.findFirst({
      where: { resetLink: token },
    });
    if (!user) throw new BadRequestException("Invalid or expired reset token");

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.users.update({
      where: { id: user.id },
      data: { password: hashed, resetLink: null },
    });

    return { message: "Password reset successfully" };
  }

  async refresh(res: Response, refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException("No refresh token");

    const payload = this.jwtService.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.id);
    if (!user || !user.token)
      throw new UnauthorizedException("Invalid refresh token");

    const isMatch = await bcrypt.compare(refreshToken, user.token);
    if (!isMatch) throw new UnauthorizedException("Invalid refresh token");

    const tokens = await this.jwtService.generateTokens(user);
    await this.usersService.updateToken(user.id, tokens.refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: this.config.get("NODE_ENV") === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  async signOut(res: Response, refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException("Not logged in");

    const payload = this.jwtService.decodeToken(refreshToken);
    if (payload?.id) await this.usersService.updateToken(payload.id, null);

    res.clearCookie("refreshToken");
    return { message: "Signed out successfully" };
  }

  async me(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    const { password, token, otp_code, otp_expire, resetLink, ...safeUser } =
      user;
    return safeUser;
  }

  async resetPasswordWithoutToken(
    id: number,
    newPassword: string,
    confirmNewPassword: string
  ) {
    if (newPassword !== confirmNewPassword)
      throw new BadRequestException("Passwords do not match");

    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException("User not found");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: "Password reset successfully" };
  }
}
