import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationsController } from "./notifications.controller";

@Module({
  imports: [PrismaModule],
  providers: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
