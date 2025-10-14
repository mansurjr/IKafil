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

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({
    status: 400,
    description: "Invalid data provided or user already exists",
  })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post("signin")
  @ApiOperation({ summary: "Sign in an existing user (login)" })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid email or password" })
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signIn(dto, res);
  }

  @Post("send-otp")
  @ApiOperation({ summary: "Send OTP (verification code) to email address" })
  @ApiBody({ schema: { example: { email: "qobiljon@example.com" } } })
  @ApiResponse({ status: 200, description: "OTP sent successfully" })
  @ApiResponse({ status: 404, description: "Email not found" })
  async sendOtp(@Body("email") email: string) {
    return this.authService.sendOtp(email);
  }

  @Post("verify-otp")
  @ApiOperation({ summary: "Verify the OTP sent to email" })
  @ApiBody({
    schema: { example: { email: "qobiljon@example.com", otp: "123456" } },
  })
  @ApiResponse({ status: 200, description: "OTP verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired OTP" })
  async verifyOtp(
    @Body() body: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.verifyOtp(body.email, body.otp, res);
  }

  @Post("forgot-password")
  @ApiOperation({ summary: "Send password reset link to email" })
  @ApiBody({ schema: { example: { email: "qobiljon@example.com" } } })
  @ApiResponse({
    status: 200,
    description: "Password reset link sent successfully",
  })
  @ApiResponse({ status: 404, description: "Email not found" })
  async forgotPassword(@Body("email") email: string) {
    return this.authService.forgetPassword(email);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Set a new password (reset password)" })
  @ApiBody({
    schema: {
      example: {
        token: "reset_token_123",
        password: "newPassword123",
        confirmPassword: "newPassword123",
      },
    },
  })
  @ApiResponse({ status: 200, description: "Password successfully changed" })
  @ApiResponse({
    status: 400,
    description: "Invalid token or passwords do not match",
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

  @Get("refresh")
  @UseGuards(JwtRefresh)
  @ApiOperation({ summary: "Get new access token using refresh token" })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "New tokens returned successfully" })
  @ApiResponse({ status: 401, description: "Invalid or expired refresh token" })
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @GetCurrentUser("refreshToken") refreshToken: string
  ) {
    return this.authService.refresh(res, refreshToken);
  }

  @Get("signout")
  @UseGuards(JwtRefresh)
  @ApiOperation({ summary: "Sign out the user (logout)" })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "User logged out successfully" })
  async signOut(
    @Res({ passthrough: true }) res: Response,
    @GetCurrentUser("refreshToken") refreshToken: string
  ) {
    return this.authService.signOut(res, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiOperation({ summary: "Get current authenticated user information" })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "User data returned successfully" })
  @ApiResponse({ status: 401, description: "Invalid or missing access token" })
  async me(@GetUser("id") userId: number) {
    return this.authService.me(userId);
  }

  @Get("activate/:link")
  @ApiOperation({ summary: "Activate user account via email link" })
  @ApiParam({
    name: "link",
    example: "activation_link_abc123",
    description: "Activation link",
  })
  @ApiResponse({ status: 200, description: "Account successfully activated" })
  @ApiResponse({
    status: 400,
    description: "Invalid or expired activation link",
  })
  async activate(@Param("link") activationLink: string) {
    return this.authService.activate(activationLink);
  }

  @Post("reset-password-no-token")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Reset password without a token (directly via email/phone)",
  })
  @ApiBody({
    schema: {
      example: {
        newPassword: "newPassword123",
        confirmNewPassword: "newPassword123",
      },
    },
  })
  @ApiResponse({ status: 200, description: "Password reset successfully" })
  @ApiResponse({ status: 400, description: "Passwords do not match" })
  @ApiResponse({ status: 404, description: "User not found" })
  async resetPasswordWithoutToken(
    @Body()
    body: {
      newPassword: string;
      confirmNewPassword: string;
    },
    @GetCurrentUser("id") id: number
  ) {
    return this.authService.resetPasswordWithoutToken(
      id,
      body.newPassword,
      body.confirmNewPassword
    );
  }
}
