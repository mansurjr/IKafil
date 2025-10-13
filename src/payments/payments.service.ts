import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentStatus } from "@prisma/client";

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, buyerId: number) {
    const contract = await this.prisma.contracts.findUnique({
      where: { id: dto.contract_id },
    });
    if (!contract) {
      throw new NotFoundException(
        `Contract with id ${dto.contract_id} not found`
      );
    }

    if (contract.buyer_id !== buyerId) {
      throw new ForbiddenException(
        `You are not allowed to pay for this contract`
      );
    }

    let amountStr: string;
    if (typeof (dto as any).amount === "number") {
      amountStr = (dto as any).amount.toFixed(2);
    } else {
      amountStr = (dto as any).amount;
    }
    if (!amountStr) {
      throw new BadRequestException("Payment amount is required");
    }

    const nextSchedule = await this.prisma.payment_schedule.findFirst({
      where: { contract_id: dto.contract_id, status: "pending" },
      orderBy: { due_date: "asc" },
    });

    if (!nextSchedule) {
      throw new BadRequestException(
        `No pending payment schedule found for contract ${dto.contract_id}`
      );
    }

    const schedulePaidAmount = nextSchedule.paid_amount ?? "0";
    const prev = Number(schedulePaidAmount);
    const paid = Number(amountStr);
    if (isNaN(paid) || paid <= 0) {
      throw new BadRequestException("Invalid payment amount");
    }

    let newPaidAmount = prev + paid;
    const amountDue = Number(String(nextSchedule.amount_due));
    const scheduleStatus = newPaidAmount >= amountDue ? "paid" : "pending";

    const created = await this.prisma.$transaction(async (tx) => {
      const updatedSchedule = await tx.payment_schedule.update({
        where: { id: nextSchedule.id },
        data: {
          paid_amount: String(newPaidAmount.toFixed(2)),
          status: scheduleStatus,
        },
      });

      const payment = await tx.payments.create({
        data: {
          contract_id: dto.contract_id,
          amount: String(amountStr),
          payment_date: dto.payment_date
            ? new Date(dto.payment_date)
            : new Date(),
          method: (dto as any).method ?? "cash",
          status: (dto as any).status ?? "paid",
        },
      });

      const remainingBefore = Number(String(contract.remaining_balance ?? 0));
      const remainingAfter = Math.max(0, remainingBefore - paid);
      await tx.contracts.update({
        where: { id: contract.id },
        data: {
          remaining_balance: String(remainingAfter.toFixed(2)),
        },
      });

      return { payment, updatedSchedule };
    });

    return {
      message: "Payment registered successfully",
      payment: created.payment,
      payment_schedule: created.updatedSchedule,
    };
  }
  async getContractPayments(contractId: number, buyerId: number) {
    const contract = await this.prisma.contracts.findUnique({
      where: { id: contractId },
    });
    if (!contract)
      throw new NotFoundException(`Contract ${contractId} not found`);
    if (contract.buyer_id !== buyerId) {
      throw new ForbiddenException(
        "You are not allowed to view this contract's payments"
      );
    }

    const schedules = await this.prisma.payment_schedule.findMany({
      where: { contract_id: contractId },
      orderBy: { due_date: "asc" },
    });

    const payments = await this.prisma.payments.findMany({
      where: { contract_id: contractId },
      orderBy: { payment_date: "desc" },
    });

    return {
      contract: {
        id: contract.id,
        contract_number: contract.contract_number,
        total_price: contract.total_price,
        remaining_balance: contract.remaining_balance,
        start_date: contract.start_date,
        end_date: contract.end_date,
      },
      payment_schedule: schedules,
      payment_history: payments,
    };
  }

  async getByBuyerIdAndStatus(buyerId: number, status?: PaymentStatus) {
    const contracts = await this.prisma.contracts.findMany({
      where: { buyer_id: buyerId },
      select: { id: true },
    });
    const contractIds = contracts.map((c) => c.id);
    if (contractIds.length === 0) {
      throw new NotFoundException(`No contracts found for buyer ${buyerId}`);
    }

    const whereClause: any = { contract_id: { in: contractIds } };
    if (status) whereClause.status = status;

    const payments = await this.prisma.payments.findMany({
      where: whereClause,
      orderBy: { payment_date: "desc" },
    });

    if (!payments.length) {
      throw new NotFoundException(
        `No payments found for buyer with id ${buyerId}${status ? ` and status "${status}"` : ""}`
      );
    }

    return payments;
  }
  async findAll() {
    return this.prisma.payments.findMany({ orderBy: { payment_date: "desc" } });
  }

  async confirm(paymentId: number) {
    const payment = await this.prisma.payments.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Tolov topilmadi (id: ${paymentId})`);
    }

    if (payment.status === PaymentStatus.paid) {
      throw new BadRequestException("Bu tolov allaqachon tasdiqlangan");
    }

    const contract = await this.prisma.contracts.findUnique({
      where: { id: payment.contract_id },
    });

    if (!contract) {
      throw new NotFoundException("Kontrakt topilmadi");
    }

    const paidAmount = Number(payment.amount);
    const remainingBefore = Number(contract.remaining_balance || 0);
    const newRemaining = Math.max(0, remainingBefore - paidAmount);

    await this.prisma.$transaction(async (tx) => {
      await tx.payments.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.paid },
      });

      await tx.contracts.update({
        where: { id: contract.id },
        data: { remaining_balance: newRemaining.toFixed(2) },
      });
    });

    return {
      message: "Tolov muvaffaqiyatli tasdiqlandi",
      paymentId,
      newRemaining,
    };
  }

  async reject(paymentId: number, reason?: string) {
    const payment = await this.prisma.payments.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Tolov topilmadi (id: ${paymentId})`);
    }

    if (payment.status === PaymentStatus.failed) {
      throw new BadRequestException("Bu tolov allaqachon rad etilgan");
    }

    await this.prisma.payments.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.failed,
      },
    });

    return {
      message: "Tolov rad etildi",
      paymentId,
      reason: reason || "Sabab korsatilmagan",
    };
  }
}
