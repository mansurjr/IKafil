import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  Query, 
  ParseIntPipe 
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }
  
  @Get()
  async getNotifications(
    @Query('is_read') is_read?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const parsedIsRead = 
      is_read === undefined ? undefined : is_read === 'true';
    const pagination = {
      limit: limit ? parseInt(limit, 10) : 25,
      skip: skip ? parseInt(skip, 10) : 0,
    };

    return await this.notificationsService.getNotificationsByStatus(
      parsedIsRead,
      pagination,
    );
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return await this.notificationsService.markAsRead(id);
  }
}
