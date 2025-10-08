import { Module } from "@nestjs/common";
import { DeviceImagesService } from "./device-images.service";
import { DeviceImagesController } from "./device-images.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [DeviceImagesController],
  providers: [DeviceImagesService],
  exports: [DeviceImagesService],
})
export class DeviceImagesModule {}
