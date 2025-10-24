import { Module } from '@nestjs/common';
import { PaymentScheduleService } from './payment-schedule.service';
import { PaymentScheduleController } from './payment-schedule.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';


@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [PaymentScheduleController],
  providers: [PaymentScheduleService,],
})
export class PaymentScheduleModule { }
