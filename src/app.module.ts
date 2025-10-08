import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from './users/users.module';
import { RegionModule } from './region/region.module';
import { DevicesModule } from './devices/devices.module';
import { DeviceDetailsModule } from './device-details/device-details.module';
import { DeviceImagesModule } from './device-images/device-images.module';
import { InstallmentPlansModule } from './installment-plans/installment-plans.module';
import { TradeInModule } from './trade-in/trade-in.module';
import { ContractsModule } from './contracts/contracts.module';
import { PaymentsModule } from './payments/payments.module';
import { CartsModule } from './carts/carts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from './jwt/jwt.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    UsersModule,
    RegionModule,
    DevicesModule,
    DeviceDetailsModule,
    DeviceImagesModule,
    InstallmentPlansModule,
    TradeInModule,
    ContractsModule,
    PaymentsModule,
    CartsModule,
    NotificationsModule,
    AuthModule,
    PrismaModule,
    JwtModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
