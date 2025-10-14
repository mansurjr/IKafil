import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentStatus, Prisma, payment_schedule } from "@prisma/client";

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, buyerId: number) {
    const contract = await this.prisma.contracts.findUnique({
      where: { id: dto.contract_id },
    });

    if (+dto.amount < +contract?.monthly_payment!) {
      throw new ForbiddenException(
        `Minimum amount should be ${contract?.monthly_payment}`
      );
    }

    if (!contract) throw new NotFoundException("Contract not found");
    if (contract.buyer_id !== buyerId)
      throw new ForbiddenException("You can only pay for your own contract");

    const amount = Number(dto.amount);
    if (isNaN(amount) || amount <= 0)
      throw new BadRequestException("Invalid payment amount");

    const pendingSchedules = await this.prisma.payment_schedule.findMany({
      where: {
        contract_id: dto.contract_id,
        status: PaymentStatus.pending,
      },
    });

    if (!pendingSchedules.length) {
      throw new BadRequestException(
        "All payments for this contract are already completed. Cannot create a new payment."
      );
    }

    const nextPending = pendingSchedules.sort(
      (a, b) => a.due_date.getTime() - b.due_date.getTime()
    )[0];

    if (amount > Number(nextPending.amount_due)) {
      throw new BadRequestException(
        `Payment amount exceeds the next pending payment (${nextPending.amount_due})`
      );
    }

    const payment = await this.prisma.payments.create({
      data: {
        contract_id: dto.contract_id,
        amount: amount.toFixed(2),
        method: dto.method || "cash",
        status: PaymentStatus.pending,
      },
    });

    return {
      message: "Payment created and pending confirmation",
      payment,
    };
  }
  async updateStatus(paymentId: number, status: PaymentStatus) {
    const payment = await this.prisma.payments.findUnique({
      where: { id: paymentId },
    });

    if (!payment)
      throw new NotFoundException(`Payment not found (id: ${paymentId})`);

    const contract = await this.prisma.contracts.findUnique({
      where: { id: payment.contract_id },
    });
    if (!contract)
      throw new NotFoundException(
        `Contract ${payment.contract_id} not found for this payment`
      );

    if (status === PaymentStatus.paid) {
      const amount = Number(payment.amount);
      const remainingBefore = Number(contract.remaining_balance || 0);
      const newRemaining = Math.max(0, remainingBefore - amount);

      const updated = await this.prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payments.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.paid, payment_date: new Date() },
        });

        const currentSchedule = await tx.payment_schedule.findFirst({
          where: { contract_id: contract.id, status: PaymentStatus.pending },
          orderBy: { due_date: "asc" },
        });

        if (currentSchedule) {
          await tx.payment_schedule.update({
            where: { id: currentSchedule.id },
            data: {
              status: PaymentStatus.paid,
              paid_amount: amount,
              amount_due: 0,
            },
          });
        }

        const updatedContract = await tx.contracts.update({
          where: { id: contract.id },
          data: { remaining_balance: newRemaining.toFixed(2) },
        });

        if (newRemaining <= 0) {
          await tx.payment_schedule.updateMany({
            where: { contract_id: contract.id },
            data: {
              status: PaymentStatus.paid,
              amount_due: 0,
              paid_amount: undefined,
            },
          });

          await tx.contracts.update({
            where: { id: contract.id },
            data: { status: "completed", remaining_balance: "0" },
          });

          return {
            updatedPayment,
            message: "All payments completed, contract fully closed",
          };
        }

        const remainingSchedules = await tx.payment_schedule.findMany({
          where: { contract_id: contract.id, status: PaymentStatus.pending },
          orderBy: { due_date: "asc" },
        });

        if (remainingSchedules.length > 0 && newRemaining > 0) {
          const newMonthly = parseFloat(
            (newRemaining / remainingSchedules.length).toFixed(2)
          );

          for (const schedule of remainingSchedules) {
            await tx.payment_schedule.update({
              where: { id: schedule.id },
              data: { amount_due: newMonthly },
            });
          }
        }

        return { updatedPayment, updatedContract };
      });

      return {
        message: "Payment processed successfully",
        paymentId,
        remaining_balance: updated.updatedContract!.remaining_balance,
      };
    }

    if (status === PaymentStatus.failed) {
      await this.prisma.payments.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.failed },
      });
      return { message: "Payment rejected", paymentId };
    }

    throw new BadRequestException("Invalid status update type");
  }

  async getContractPayments(contractId: number, buyerId: number) {
    const contract = await this.prisma.contracts.findUnique({
      where: { id: contractId },
    });
    if (!contract)
      throw new NotFoundException(`Contract ${contractId} not found`);
    if (contract.buyer_id !== buyerId)
      throw new ForbiddenException("You cannot view another user's payments");

    const [schedules, payments] = await Promise.all([
      this.prisma.payment_schedule.findMany({
        where: { contract_id: contractId },
        orderBy: { due_date: "asc" },
      }),
      this.prisma.payments.findMany({
        where: { contract_id: contractId },
        orderBy: { payment_date: "desc" },
      }),
    ]);

    return {
      contract: {
        id: contract.id,
        contract_number: contract.contract_number,
        total_price: contract.total_price,
        remaining_balance: contract.remaining_balance,
        start_date: contract.start_date,
        end_date: contract.end_date,
      },
      schedule: schedules,
      history: payments,
    };
  }

  async getByBuyerIdAndStatus(buyerId: number, status?: PaymentStatus) {
    const contracts = await this.prisma.contracts.findMany({
      where: { buyer_id: buyerId },
      select: { id: true },
    });
    if (!contracts.length)
      throw new NotFoundException(`No contracts found for this buyer`);

    const where: Prisma.paymentsWhereInput = {
      contract_id: { in: contracts.map((c) => c.id) },
      ...(status ? { status } : {}),
    };

    const payments = await this.prisma.payments.findMany({
      where,
      orderBy: { payment_date: "desc" },
    });

    if (!payments.length)
      throw new NotFoundException("No payments found for this buyer");

    return payments;
  }

  async findAll() {
    return this.prisma.payments.findMany({
      orderBy: { payment_date: "desc" },
    });
  }
}
