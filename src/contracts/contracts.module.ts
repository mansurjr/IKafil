import { Module } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ContractsController } from "./contracts.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { InstallmentPlansModule } from "../installment-plans/installment-plans.module";
import { DevicesModule } from "../devices/devices.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PrismaModule, DevicesModule, InstallmentPlansModule, NotificationsModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
