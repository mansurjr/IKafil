import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  PaymentStatus,
  PaymentMethod,
  Prisma,
  payment_schedule,
} from "@prisma/client";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 💰 1. Create payment (cash -> auto paid, online -> pending)
   */
  async create(dto: CreatePaymentDto, buyerId: number) {
    const contract = await this.prisma.contracts.findUnique({
      where: { id: dto.contract_id },
    });

    if (!contract) throw new NotFoundException("Contract not found");
    if (contract.buyer_id !== buyerId)
      throw new ForbiddenException("You can only pay for your own contract");

    const amount = Number(dto.amount);
    if (isNaN(amount) || amount <= 0)
      throw new BadRequestException("Invalid payment amount");

    const nextPending = await this.prisma.payment_schedule.findFirst({
      where: { contract_id: dto.contract_id, status: PaymentStatus.pending },
      orderBy: { due_date: "asc" },
    });

    if (!nextPending)
      throw new BadRequestException("All payments are already completed");

    const scheduleRemaining =
      Number(nextPending.amount_due) - Number(nextPending.paid_amount ?? 0);

    if (amount > scheduleRemaining)
      throw new BadRequestException(
        `Payment exceeds next required amount (${scheduleRemaining.toFixed(2)})`
      );

    const payment = await this.prisma.payments.create({
      data: {
        contract_id: dto.contract_id,
        amount: amount.toFixed(2),
        method: dto.method,
        status:
          dto.method === PaymentMethod.cash
            ? PaymentStatus.paid
            : PaymentStatus.pending,
        payment_date: dto.method === PaymentMethod.cash ? new Date() : null,
      },
    });

    if (dto.method === PaymentMethod.cash) {
      const result = await this.updateStatus(payment.id, PaymentStatus.paid);
      return {
        message: "✅ Cash payment accepted and confirmed.",
        payment: result.payment,
        updatedSchedule: result.updatedSchedule,
        newRemaining: result.newRemaining,
      };
    }

    return {
      message: "💳 Online payment created. Waiting for confirmation.",
      payment,
    };
  }

  /**
   * 🔁 2. Admin/processor confirms or rejects payment
   *
   * Note:
   * - We compute schedule updates for the next pending schedule only (partial allowed).
   * - After schedule updates we recompute remaining_balance using aggregate sum of amount_due
   *   from payment_schedule (this ensures contract.remaining_balance always equals
   *   sum of outstanding schedule amounts).
   */
  async updateStatus(paymentId: number, status: PaymentStatus) {
    const payment = await this.prisma.payments.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException("Payment not found");

    if (
      payment.status === PaymentStatus.paid &&
      status === PaymentStatus.paid
    ) {
      return {
        message: "Payment is already confirmed.",
        payment,
        updatedSchedule: null,
        newRemaining: Number(
          (
            await this.prisma.contracts.findUnique({
              where: { id: payment.contract_id },
              select: { remaining_balance: true },
            })
          )?.remaining_balance ?? 0
        ),
      };
    }

    if (payment.status !== PaymentStatus.pending)
      throw new BadRequestException(
        `Only pending payments can be updated (current: ${payment.status})`
      );

    const contract = await this.prisma.contracts.findUnique({
      where: { id: payment.contract_id },
    });
    if (!contract) throw new NotFoundException("Contract not found");

    if (status === PaymentStatus.paid) {
      const amount = Number(payment.amount);

      return await this.prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payments.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.paid,
            payment_date: new Date(),
          },
        });

        const nextSchedule = await tx.payment_schedule.findFirst({
          where: { contract_id: contract.id, status: PaymentStatus.pending },
          orderBy: { due_date: "asc" },
        });

        let updatedSchedule: payment_schedule | null = null;
        if (nextSchedule) {
          const prevPaid = Number(nextSchedule.paid_amount ?? 0);
          const originalAmountDue = Number(nextSchedule.amount_due) + prevPaid;

          const scheduleRemaining = Number(nextSchedule.amount_due);
          const amountToApply = Math.min(amount, scheduleRemaining);
          const newPaid = prevPaid + amountToApply;
          const newAmountDue = Math.max(0, scheduleRemaining - amountToApply);

          updatedSchedule = await tx.payment_schedule.update({
            where: { id: nextSchedule.id },
            data: {
              paid_amount: newPaid.toFixed(2),
              amount_due: newAmountDue.toFixed(2),
              status:
                newAmountDue <= 0 ? PaymentStatus.paid : PaymentStatus.pending,
            },
          });
        }

        const agg = await tx.payment_schedule.aggregate({
          where: { contract_id: contract.id },
          _sum: { amount_due: true },
        });

        const remainingSum = Number(agg._sum.amount_due ?? 0);

        const updatedContract = await tx.contracts.update({
          where: { id: contract.id },
          data: { remaining_balance: remainingSum.toFixed(2) },
        });

        if (remainingSum <= 0) {
          const stillPending = await tx.payment_schedule.count({
            where: {
              contract_id: contract.id,
              status: PaymentStatus.pending,
            },
          });

          if (stillPending === 0) {
            await tx.contracts.update({
              where: { id: contract.id },
              data: { status: "completed" },
            });
          }
        }

        return {
          message: "✅ Payment confirmed successfully",
          payment: updatedPayment,
          updatedSchedule,
          newRemaining: updatedContract.remaining_balance,
        };
      });
    }

    if (status === PaymentStatus.failed) {
      const failed = await this.prisma.payments.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.failed },
      });
      return { message: "❌ Payment marked as failed", payment: failed };
    }

    throw new BadRequestException("Invalid status update");
  }

  /**
   * 📜 3. Buyer payment history + schedule
   */
  async getContractPayments(contractId: number, buyerId: number) {
    const contract = await this.prisma.contracts.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException("Contract not found");
    if (contract.buyer_id !== buyerId)
      throw new ForbiddenException("Access denied");

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
        status: contract.status,
      },
      schedule: schedules,
      history: payments,
    };
  }

  /**
   * 🧮 4. Admin: get all payments
   */
  async findAll() {
    return this.prisma.payments.findMany({
      orderBy: { payment_date: "desc" },
    });
  }
  /**
   * 👤 5. Get all payments for a buyer (optionally filtered by status)
   */
  async getByBuyerIdAndStatus(buyerId: number, status?: PaymentStatus) {
    const contracts = await this.prisma.contracts.findMany({
      where: { buyer_id: buyerId },
      select: { id: true, contract_number: true },
    });

    if (!contracts.length)
      throw new NotFoundException("No contracts found for this buyer");

    const contractIds = contracts.map((c) => c.id);

    const payments = await this.prisma.payments.findMany({
      where: {
        contract_id: { in: contractIds },
        ...(status ? { status } : {}),
      },
      orderBy: { payment_date: "desc" },
      include: {
        contract: {
          select: {
            contract_number: true,
            total_price: true,
            remaining_balance: true,
            status: true,
            start_date: true,
            end_date: true,
          },
        },
      },
    });

    return {
      buyerId,
      totalContracts: contracts.length,
      totalPayments: payments.length,
      statusFilter: status ?? "all",
      payments,
    };
  }
}
