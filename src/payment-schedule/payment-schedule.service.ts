import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentScheduleDto } from "./dto/create-payment-schedule.dto";
import { UpdatePaymentScheduleDto } from "./dto/update-payment-schedule.dto";
import { PaymentStatus } from "@prisma/client";
import { Cron, CronExpression } from "@nestjs/schedule";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class PaymentScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) { }


  async create(createPaymentScheduleDto: CreatePaymentScheduleDto) {
    return this.prisma.payment_schedule.create({
      data: createPaymentScheduleDto,
    });
  }

  async findAll() {
    return this.prisma.payment_schedule.findMany({
      orderBy: { due_date: "asc" },
    });
  }

  async findOne(id: number) {
    const schedule = await this.prisma.payment_schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException(`Payment schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(id: number, updatePaymentScheduleDto: UpdatePaymentScheduleDto) {
    const exists = await this.prisma.payment_schedule.findUnique({
      where: { id },
    });
    if (!exists) {
      throw new NotFoundException(`Payment schedule with ID ${id} not found`);
    }

    return this.prisma.payment_schedule.update({
      where: { id },
      data: updatePaymentScheduleDto,
    });
  }

  async remove(id: number) {
    const exists = await this.prisma.payment_schedule.findUnique({
      where: { id },
    });
    if (!exists) {
      throw new NotFoundException(`Payment schedule with ID ${id} not found`);
    }

    return this.prisma.payment_schedule.delete({ where: { id } });
  }

  // --- QUERY HELPERS ---

  async getByContractId(contractId: number) {
    const schedules = await this.prisma.payment_schedule.findMany({
      where: { contract_id: contractId },
      orderBy: { due_date: "asc" },
    });

    if (!schedules.length) {
      throw new NotFoundException(
        `No payment schedules found for contract ID ${contractId}`,
      );
    }

    return schedules;
  }

  async getByContractIdAndStatus(contractId: number, status: PaymentStatus) {
    const schedules = await this.prisma.payment_schedule.findMany({
      where: { contract_id: contractId, status },
      orderBy: { due_date: "asc" },
    });

    if (!schedules.length) {
      throw new NotFoundException(
        `No payment schedules found for contract ${contractId} with status "${status}"`,
      );
    }

    return schedules;
  }

  async getByBuyerIdAndStatus(buyerId: number, status?: PaymentStatus) {
    const contracts = await this.prisma.contracts.findMany({
      where: { buyer_id: buyerId },
      select: { id: true },
    });

    if (!contracts.length) {
      throw new NotFoundException(`No contracts found for buyer ${buyerId}`);
    }

    const contractIds = contracts.map((c) => c.id);

    const schedules = await this.prisma.payment_schedule.findMany({
      where: {
        contract_id: { in: contractIds },
        ...(status ? { status } : {}),
      },
      orderBy: { due_date: "asc" },
    });

    if (!schedules.length) {
      throw new NotFoundException(
        `No payment schedules found for buyer ${buyerId}${status ? ` with status "${status}"` : ""
        }`,
      );
    }

    return schedules;
  }

  // --- CRON JOB (runs every week) ---
  @Cron(CronExpression.EVERY_WEEK)
  async checkCurrentMonthPayments() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const unpaidSchedules = await this.prisma.payment_schedule.findMany({
      where: {
        due_date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: {
          not: PaymentStatus.paid,
        },
      },
      include: {
        contract: {
          include: {
            buyer: true,
          },
        },
      },
    });

    if (!unpaidSchedules.length) return;

    for (const schedule of unpaidSchedules) {
      const buyer = schedule.contract?.buyer;

      if (!buyer) {
        console.warn(`⚠️ Skipping schedule ${schedule.id}: no buyer found.`);
        continue;
      }

      const buyerName = buyer.full_name || `Buyer#${buyer.id}`;
      const dueDate = schedule.due_date.toISOString().split("T")[0];

      try {
        await this.notificationsService.sendViaSMS({
          reciever_id: buyer.id,
          reciever: buyer.phone || undefined,
          message: `Hurmatli ${buyerName}, sizning to'lov muddati ${dueDate} sanasida tugaydi. Iltimos, to'lovni amalga oshiring.`,
        });
      } catch (err) {
        console.error(`❌ Failed to send SMS to ${buyerName}: ${err.message}`);
      }
    }
  }

}
