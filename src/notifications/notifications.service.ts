import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) { }

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
}
