import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";

@ApiTags("Notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: "Get all notifications (with optional filters)",
    description:
      "Retrieves notifications with optional filtering by read status, and supports pagination via limit and skip query parameters.",
  })
  @ApiQuery({
    name: "is_read",
    required: false,
    type: Boolean,
    description: "Filter notifications by read status (true or false)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of notifications to return (default: 25)",
  })
  @ApiQuery({
    name: "skip",
    required: false,
    type: Number,
    description: "Number of notifications to skip (default: 0)",
  })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully.",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid query parameters.",
  })
  async getNotifications(
    @Query("is_read") is_read?: string,
    @Query("limit") limit?: string,
    @Query("skip") skip?: string
  ) {
    const parsedIsRead = is_read === undefined ? undefined : is_read === "true";

    const pagination = {
      limit: limit ? parseInt(limit, 10) : 25,
      skip: skip ? parseInt(skip, 10) : 0,
    };

    const parsedLimit = limit ? parseInt(limit, 10) : 25;
    const parsedSkip = skip ? parseInt(skip, 10) : 0;

    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
      throw new BadRequestException("Pagination parameters must be numbers");
    }

    return this.notificationsService.getNotificationsByStatus(
      user_id,
      parsedIsRead,
      pagination
    );
  }

  @Patch(":id/read")
  @ApiOperation({
    summary: "Mark a notification as read",
    description: "Marks a specific notification as read using its ID.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Notification ID to be marked as read",
  })
  @ApiResponse({
    status: 200,
    description: "Notification marked as read successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "Notification not found.",
  })
  async markAsRead(@Param("id", ParseIntPipe) id: number) {
    return await this.notificationsService.markAsRead(id);
  }
}
