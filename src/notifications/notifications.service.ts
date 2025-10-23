import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly API_URL = 'https://api.httpsms.com/v1/messages/send';
  private readonly API_KEY =
    'uk_4SOc8-y-LDbQSm1iRp62-9eXLKK5dzEWHujiNe9eW648YzqPjDyPzEYR3bp_1wsm';
  private readonly FROM_NUMBER = '+998935045345';

  constructor(private readonly prisma: PrismaService) { }

  async sendViaSMS(createNotificationDto: CreateNotificationDto) {
    const { reciever_id, reciever, message } = createNotificationDto;

    if (!message) {
      throw new ForbiddenException('Message cannot be empty');
    }

    let phone: string;

    if (reciever_id) {
      const user = await this.prisma.users.findUnique({
        where: { id: reciever_id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.phone) {
        throw new ForbiddenException('User has no phone number');
      }

      phone = user.phone;
    } else if (reciever) {
      phone = reciever;
    } else {
      throw new ForbiddenException('Receiver phone number is required');
    }

    try {
      const response = await axios.post(
        this.API_URL,
        {
          content: message,
          from: this.FROM_NUMBER,
          to: phone,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.API_KEY,
          },
        },
      );

      return {
        success: true,
        message: '✅ SMS yuborildi',
        data: response.data,
      };
    } catch (error) {
      if (error.response) {
        throw new ForbiddenException({
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        throw new ForbiddenException(`Tarmoq xatosi: ${error.message}`);
      }
    }
  }
}
