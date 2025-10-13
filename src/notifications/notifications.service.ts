import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notifications.create({
      data: createNotificationDto,
    });
    return notification;
  }
  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notifications.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException(
        "You can only mark your own notifications as read"
      );
    }

    return this.prisma.notifications.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async getNotificationsByStatus(
    user_id: number,
    is_read?: boolean,
    pagination: { limit?: number; skip?: number } = {}
  ) {
    const { limit = 25, skip = 0 } = pagination;

    const whereClause = typeof is_read === "boolean" ? { is_read } : {};

    return await this.prisma.notifications.findMany({
      where: { ...whereClause, user_id },
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
    });
  }
}
