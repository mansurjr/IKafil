import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { RegionModule } from "./region/region.module";
import { DevicesModule } from "./devices/devices.module";
import { BranchModule } from "./branch/branch.module";
import { DeviceDetailsModule } from "./device-details/device-details.module";
import { DeviceImagesModule } from "./device-images/device-images.module";
import { InstallmentPlansModule } from "./installment-plans/installment-plans.module";
import { ContractsModule } from "./contracts/contracts.module";
import { PaymentsModule } from "./payments/payments.module";
import { CartsModule } from "./carts/carts.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { JwtModule } from "./jwt/jwt.module";
import { MulterModule } from "@nestjs/platform-express";
import { MailModule } from "./mail/mail.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { PaymentScheduleModule } from "./payment-schedule/payment-schedule.module";
import { JwtStrategy } from "./common/strategies/access-strategy";
import { RefreshJwtStrategy } from "./common/strategies/refresh-strategy";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    MulterModule.register({
      dest: "./uploads",
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      serveRoot: "/uploads",
    }),
    UsersModule,
    RegionModule,
    DevicesModule,
    DeviceDetailsModule,
    DeviceImagesModule,
    InstallmentPlansModule,
    ContractsModule,
    PaymentsModule,
    CartsModule,
    NotificationsModule,
    AuthModule,
    PrismaModule,
    JwtModule,
    MailModule,
    PaymentScheduleModule,
    BranchModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, RefreshJwtStrategy],
})
export class AppModule {}
