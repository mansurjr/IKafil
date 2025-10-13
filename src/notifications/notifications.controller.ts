import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { GetCurrentUser } from "../common/decorators/getCurrentUserid";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications
   * Retrieves all notifications for the current user with optional filtering and pagination.
   */
  @Get()
  @ApiOperation({
    summary: "Get all notifications",
    description:
      "Retrieve all notifications for the authenticated user. Supports filtering by read status and pagination (limit, skip).",
  })
  @ApiQuery({
    name: "is_read",
    required: false,
    type: Boolean,
    description:
      "Filter notifications by read status (true = read, false = unread)",
    example: false,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of notifications to return (default: 25)",
    example: 25,
  })
  @ApiQuery({
    name: "skip",
    required: false,
    type: Number,
    description: "Number of notifications to skip (default: 0)",
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: "List of notifications retrieved successfully.",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid query parameters.",
  })
  async getNotifications(
    @GetCurrentUser("id") user_id: number,
    @Query("is_read") is_read?: string,
    @Query("limit") limit?: string,
    @Query("skip") skip?: string
  ) {
    // Parse is_read flag properly
    const parsedIsRead =
      is_read === undefined
        ? undefined
        : is_read.toLowerCase() === "true"
          ? true
          : is_read.toLowerCase() === "false"
            ? false
            : (() => {
                throw new BadRequestException(
                  "is_read must be 'true' or 'false'"
                );
              })();

    // Validate pagination
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
  @ApiOperation({
    summary: "Mark a notification as read",
    description: "Marks the specified notification as read by its ID.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The ID of the notification to mark as read.",
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: "Notification marked as read successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "Notification not found.",
  })
  @ApiResponse({
    status: 403,
    description:
      "You do not have permission to mark this notification as read.",
  })
  async markAsRead(
    @Param("id", ParseIntPipe) id: number,
    @GetCurrentUser("id") user_id: number
  ) {
    return this.notificationsService.markAsRead(id, user_id);
  }
}
