import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigModule } from "@nestjs/config";
import { MailModule } from "../mail/mail.module";
import { JwtModule } from "../jwt/jwt.module"; 

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    MailModule,
    JwtModule, 
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
