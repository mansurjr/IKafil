import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
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

  async markAsRead(id: number,) {
    const notification = await this.prisma.notifications.update({
      where: { id },
      data: { is_read: true },
    });

    return notification;
  }

  async getNotificationsByStatus(
    is_read?: boolean,
    pagination: { limit?: number; skip?: number } = {}
  ) {
    const { limit = 25, skip = 0 } = pagination;

    const whereClause = typeof is_read === 'boolean' ? { is_read } : {};

    return await this.prisma.notifications.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    });
  }

  
}
