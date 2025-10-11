import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentStatus } from "@prisma/client";

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
  async getByBuyerIdAndStatus(buyerId: number, status?: PaymentStatus) {
    const payments = await this.prisma.payments.findMany({
      where: {
        contract: {
          buyer_id: buyerId,
        },
        ...(status ? { status } : {}), // Agar status berilgan bo‘lsa — filter qo‘llanadi
      },
      include: {
        contract: true, // kerak bo‘lsa contract ma’lumotlari bilan qaytaradi
      },
    });

    if (!payments.length) {
      throw new NotFoundException(
        `No payments found for buyer with id ${buyerId}${
          status ? ` and status "${status}"` : ""
        }`
      );
    }

    return payments;
  }
}
