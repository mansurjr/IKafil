import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
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

  async findAll() {
    const notification = await this.prisma.notifications.findMany();
    return notification;
  }

  async findOne(id: number) {
    const notification = await this.prisma.notifications.findUnique({
      where: {
        id,
      },
    });
    return notification;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.prisma.notifications.update({
      where: {
        id,
      },
      data: updateNotificationDto,
    });
    return notification;
  }

  async remove(id: number) {
    const notification = await this.prisma.notifications.delete({
      where: {
        id,
      },
    });
    return notification;
  }
}
