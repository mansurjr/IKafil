import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Param,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "../users/dto/sign-in.dto";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import {
  GetCurrentUser,
  GetCurrentUser as GetUser,
} from "../common/decorators/getCurrentUser";
import { JwtRefresh } from "../common/guards/refreshToken.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** ---------------- REGISTER ---------------- */
  @Post("register")
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  /** ---------------- SIGN IN ---------------- */
  @Post("signin")
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signIn(dto, res);
  }

  /** ---------------- SEND OTP ---------------- */
  @Post("send-otp")
  async sendOtp(@Body("email") email: string) {
    return this.authService.sendOtp(email);
  }

  /** ---------------- VERIFY OTP ---------------- */
  @Post("verify-otp")
  async verifyOtp(
    @Body() body: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.verifyOtp(body.email, body.otp, res);
  }

  /** ---------------- FORGOT PASSWORD ---------------- */
  @Post("forgot-password")
  async forgotPassword(@Body("email") email: string) {
    return this.authService.forgetPassword(email);
  }

  /** ---------------- RESET PASSWORD ---------------- */
  @Post("reset-password")
  async resetPassword(
    @Body() body: { token: string; password: string; confirmPassword: string }
  ) {
    return this.authService.resetPassword(
      body.token,
      body.password,
      body.confirmPassword
    );
  }

  /** ---------------- REFRESH TOKEN ---------------- */
  @Get("refresh")
  @UseGuards(JwtRefresh)
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @GetCurrentUser("refreshToken") refreshToken: string
  ) {
    return this.authService.refresh(res, refreshToken);
  } 

  /** ---------------- SIGN OUT ---------------- */
  @Get("signout")
  @UseGuards(JwtAuthGuard, JwtRefresh)
  async signOut(
    @Res({ passthrough: true }) res: Response,
    @GetCurrentUser("refreshToken") refreshToken: string
  ) {
    return this.authService.signOut(res, refreshToken);
  }

  /** ---------------- ME ---------------- */
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@GetUser("id") userId: number) {
    return this.authService.me(userId);
  }

  /** ---------------- ACTIVATE ACCOUNT ---------------- */
  @Get("activate/:link")
  async activate(@Param("link") activationLink: string) {
    return this.authService.activate(activationLink);
  }
}
