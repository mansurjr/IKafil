import { Injectable } from '@nestjs/common';
import { CreatePaymentScheduleDto } from './dto/create-payment-schedule.dto';
import { UpdatePaymentScheduleDto } from './dto/update-payment-schedule.dto';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class PaymentScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPaymentScheduleDto: CreatePaymentScheduleDto) {
    return await this.prisma.paymentSchedule.create({
      data: createPaymentScheduleDto,
    });
  }

  async findAll() {
    return await this.prisma.paymentSchedule.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.paymentSchedule.findUnique({ where: { id } });
  }

  async update(id: number, updatePaymentScheduleDto: UpdatePaymentScheduleDto) {
    return await this.prisma.paymentSchedule.update({
      where: { id },
      data: updatePaymentScheduleDto,
    });
  }

  async remove(id: number) {
      return await this.prisma.paymentSchedule.delete({ where: { id } });
  }
}
