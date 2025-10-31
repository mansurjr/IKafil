import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [OrdersController],
  providers: [OrdersService, MailService],
  exports: [OrdersService],
})
export class OrdersModule {}
