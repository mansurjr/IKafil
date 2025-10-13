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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";

@ApiTags("Authentication") // Swaggerda bo‘lim nomi
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** ---------------- REGISTER ---------------- */
  @Post("register")
  @ApiOperation({ summary: "Yangi foydalanuvchini ro‘yxatdan o‘tkazish" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: "Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi",
  })
  @ApiResponse({
    status: 400,
    description: "Noto‘g‘ri ma'lumot kiritilgan yoki foydalanuvchi mavjud",
  })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  /** ---------------- SIGN IN ---------------- */
  @Post("signin")
  @ApiOperation({ summary: "Foydalanuvchini tizimga kirgizish (login)" })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: "Kirish muvaffaqiyatli amalga oshirildi",
  })
  @ApiResponse({ status: 401, description: "Login yoki parol noto‘g‘ri" })
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signIn(dto, res);
  }

  /** ---------------- SEND OTP ---------------- */
  @Post("send-otp")
  @ApiOperation({ summary: "Email manzilga OTP (tasdiqlash kodi) yuborish" })
  @ApiBody({
    schema: {
      example: { email: "qobiljon@example.com" },
    },
  })
  @ApiResponse({ status: 200, description: "OTP muvaffaqiyatli yuborildi" })
  @ApiResponse({ status: 404, description: "Email topilmadi" })
  async sendOtp(@Body("email") email: string) {
    return this.authService.sendOtp(email);
  }

  /** ---------------- VERIFY OTP ---------------- */
  @Post("verify-otp")
  @ApiOperation({ summary: "Email uchun yuborilgan OTP ni tasdiqlash" })
  @ApiBody({
    schema: {
      example: { email: "qobiljon@example.com", otp: "123456" },
    },
  })
  @ApiResponse({ status: 200, description: "OTP muvaffaqiyatli tasdiqlandi" })
  @ApiResponse({
    status: 400,
    description: "OTP noto‘g‘ri yoki muddati o‘tgan",
  })
  async verifyOtp(
    @Body() body: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.verifyOtp(body.email, body.otp, res);
  }

  /** ---------------- FORGOT PASSWORD ---------------- */
  @Post("forgot-password")
  @ApiOperation({ summary: "Parolni tiklash uchun emailga link yuborish" })
  @ApiBody({
    schema: {
      example: { email: "qobiljon@example.com" },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Parolni tiklash uchun link yuborildi",
  })
  @ApiResponse({ status: 404, description: "Email topilmadi" })
  async forgotPassword(@Body("email") email: string) {
    return this.authService.forgetPassword(email);
  }

  /** ---------------- RESET PASSWORD ---------------- */
  @Post("reset-password")
  @ApiOperation({ summary: "Yangi parolni o‘rnatish (reset password)" })
  @ApiBody({
    schema: {
      example: {
        token: "reset_token_123",
        password: "newPassword123",
        confirmPassword: "newPassword123",
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Parol muvaffaqiyatli o‘zgartirildi",
  })
  @ApiResponse({
    status: 400,
    description: "Token noto‘g‘ri yoki parollar mos emas",
  })
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
  @ApiOperation({ summary: "Refresh token orqali yangi access token olish" })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "Yangi tokenlar qaytarildi" })
  @ApiResponse({
    status: 401,
    description: "Refresh token noto‘g‘ri yoki muddati o‘tgan",
  })
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @GetCurrentUser("refreshToken") refreshToken: string
  ) {
    return this.authService.refresh(res, refreshToken);
  }

  /** ---------------- SIGN OUT ---------------- */
  @Get("signout")
  @UseGuards(JwtRefresh)
  @ApiOperation({ summary: "Foydalanuvchini tizimdan chiqish (logout)" })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "Foydalanuvchi tizimdan chiqdi" })
  async signOut(
    @Res({ passthrough: true }) res: Response,
    @GetCurrentUser("refreshToken") refreshToken: string
  ) {
    return this.authService.signOut(res, refreshToken);
  }

  /** ---------------- ME ---------------- */
  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiOperation({
    summary: "Hozir tizimga kirgan foydalanuvchi ma'lumotlarini olish",
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Foydalanuvchi ma'lumotlari qaytarildi",
  })
  @ApiResponse({ status: 401, description: "Token noto‘g‘ri yoki mavjud emas" })
  async me(@GetUser("id") userId: number) {
    return this.authService.me(userId);
  }

  /** ---------------- ACTIVATE ACCOUNT ---------------- */
  @Get("activate/:link")
  @ApiOperation({ summary: "Email orqali akkauntni aktivatsiya qilish" })
  @ApiParam({
    name: "link",
    example: "activation_link_abc123",
    description: "Aktivatsiya havolasi",
  })
  @ApiResponse({
    status: 200,
    description: "Akkaunt muvaffaqiyatli aktivlashtirildi",
  })
  @ApiResponse({
    status: 400,
    description: "Aktivatsiya havolasi noto‘g‘ri yoki muddati o‘tgan",
  })
  async activate(@Param("link") activationLink: string) {
    return this.authService.activate(activationLink);
  }
}
