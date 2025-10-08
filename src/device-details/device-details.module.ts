import { Module } from "@nestjs/common";
import { DeviceDetailsService } from "./device-details.service";
import { DeviceDetailsController } from "./device-details.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DeviceDetailsController],
  providers: [DeviceDetailsService],
})
export class DeviceDetailsModule {}
