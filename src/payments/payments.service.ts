import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const existingPayment = await this.prisma.payments.findFirst({
      where: { contract_id: createPaymentDto.contract_id },
    });

    if (existingPayment) {
      throw new BadRequestException("Payment already exists for this contract");
    }

    return this.prisma.payments.create({
      data: {
        ...createPaymentDto,
      },
    });
  }

  async findAll() {
    return this.prisma.payments.findMany();
  }

  async findOne(id: number) {
    const payment = this.prisma.payments.findUnique({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.prisma.payments.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return this.prisma.payments.update({
      where: { id },
      data: updatePaymentDto,
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.payments.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }

    return this.prisma.payments.delete({
      where: { id },
    });
  }
}
