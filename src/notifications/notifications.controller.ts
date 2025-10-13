import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { AuthGuard } from "@nestjs/passport";
import { GetCurrentUser } from "../common/decorators/getCurrentUserid";

@Controller("notifications")
@UseGuards(AuthGuard("jwt"))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Get()
  async getNotifications(
    @GetCurrentUser("id") user_id: number,
    @Query("is_read") is_read?: string,
    @Query("limit") limit?: string,
    @Query("skip") skip?: string
  ) {
    const parsedIsRead =
      is_read === undefined ? undefined : is_read.toLowerCase() === "true";

    const parsedLimit = limit ? parseInt(limit, 10) : 25;
    const parsedSkip = skip ? parseInt(skip, 10) : 0;

    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
      throw new BadRequestException("Pagination parameters must be numbers");
    }

    return this.notificationsService.getNotificationsByStatus(
      user_id,
      parsedIsRead,
      {
        limit: parsedLimit,
        skip: parsedSkip,
      }
    );
  }

  @Patch(":id/read")
  async markAsRead(
    @Param("id", ParseIntPipe) id: number,
    @GetCurrentUser("id") userId: number
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }
}
