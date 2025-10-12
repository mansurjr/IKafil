import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { users as User } from "@prisma/client";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST"),
      port: Number(this.configService.get<string>("SMTP_PORT")),
      secure: false,
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASS"),
      },
    });
  }

  private async send(mailOptions: nodemailer.SendMailOptions) {
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Mail sending error:", error);
      throw new ServiceUnavailableException(
        "Failed to send email, Please retry later!"
      );
    }
  }

  /** ---------------- ACTIVATE ACCOUNT MAIL ---------------- */
  async sendMail(mail: string, activationLink: string): Promise<void> {
    const NewactivationLink = `${this.configService.get<string>(
      "APP_URL"
    )}/api/auth/activate/${activationLink}`;

    const mailOptions = {
      from: this.configService.get<string>("SMTP_FROM"),
      to: mail!,
      subject: "Activate Your Account - IKafil",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Hello!</h2>
          <p>Welcome to <strong>IKafil</strong> — your trusted shop for phones and accessories.</p>
          <p>Please activate your account by clicking the link below:</p>
          <a href="${NewactivationLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">Activate Account</a>
          <p style="margin-top: 20px;">If you did not register on IKafil, please ignore this email.</p>
        </div>
      `,
    };

    await this.send(mailOptions);
  }

  /** ---------------- RESET PASSWORD MAIL ---------------- */
  async sendResetMail(user: User): Promise<void> {
    const resetLink = `${this.configService.get<string>(
      "APP_URL"
    )}/auth/reset-password/${user.resetLink}`;

    const mailOptions = {
      from: this.configService.get<string>("SMTP_FROM"),
      to: user.email!,
      subject: "Reset Your Password - IKafil",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password for your <strong>IKafil</strong> account.</p>
          <p>Click the link below to create a new password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #dc3545; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px;">If you didn’t request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    };

    await this.send(mailOptions);
  }
  async sendOtpMail(to: string, otp: string) {
    await this.transporter.sendMail({
      to,
      subject: "Your Login OTP Code",
      html: `<p>Your verification code is: <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
  }

  async sendResetPasswordMail(user: any, resetLink: string) {
    await this.transporter.sendMail({
      to: user.email,
      subject: "Reset your password",
      html: `
      <h3>Hello ${user.full_name}</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
    });
  }
}
