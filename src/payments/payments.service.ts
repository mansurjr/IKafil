import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentStatus, PaymentMethod } from "@prisma/client";

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    const contract = await this.prisma.contracts.findUnique({
      where: { id: dto.contract_id },
      include: { payment_schedule: true },
    });

    if (!contract) {
      throw new NotFoundException(
        `Contract with ID ${dto.contract_id} not found`
      );
    }

    const schedule = await this.prisma.payment_schedule.findFirst({
      where: { contract_id: dto.contract_id, status: PaymentStatus.pending },
      orderBy: { due_date: "asc" },
    });

    if (!schedule) {
      throw new BadRequestException("All payments are already completed.");
    }

    const payment = await this.prisma.payments.create({
      data: {
        contract_id: dto.contract_id,
        amount: dto.amount,
        method: dto.method ?? PaymentMethod.cash,
        status: PaymentStatus.pending,
        payment_date: new Date(),
      },
    });

    return {
      message: "Payment created successfully",
      payment,
    };
  }

  async confirmPayment(paymentId: number) {
    const payment = await this.prisma.payments.findUnique({
      where: { id: paymentId },
    });

    if (!payment) throw new NotFoundException("Payment not found");

    if (payment.status === PaymentStatus.paid)
      throw new BadRequestException("Payment already completed");

    const schedule = await this.prisma.payment_schedule.findFirst({
      where: {
        contract_id: payment.contract_id,
        status: PaymentStatus.pending,
      },
      orderBy: { due_date: "asc" },
    });

    if (!schedule) throw new NotFoundException("No pending schedule found");

    return this.prisma.$transaction(async (tx) => {
      await tx.payments.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.paid },
      });

      await tx.payment_schedule.update({
        where: { id: schedule.id },
        data: { status: PaymentStatus.paid },
      });

      const contract = await tx.contracts.findUnique({
        where: { id: payment.contract_id },
      });

      await tx.contracts.update({
        where: { id: payment.contract_id },
        data: {
          remaining_balance:
            contract!.remaining_balance.toNumber() - payment.amount.toNumber(),
        },
      });

      return { message: "Payment confirmed successfully" };
    });
  }

  async rejectPayment(paymentId: number, reason?: string) {
    const payment = await this.prisma.payments.findUnique({
      where: { id: paymentId },
    });

    if (!payment) throw new NotFoundException("Payment not found");

    return this.prisma.payments.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.failed,
      },
    });
  }

  async getPaymentsByContract(contract_id: number) {
    return this.prisma.payments.findMany({
      where: { contract_id },
      orderBy: { payment_date: "asc" },
    });
  }

  async findAll() {
    return this.prisma.payments.findMany({
      include: { contract: true },
      orderBy: { payment_date: "desc" },
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
