import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentScheduleDto } from "./dto/create-payment-schedule.dto";
import { UpdatePaymentScheduleDto } from "./dto/update-payment-schedule.dto";
import { PaymentStatus } from "@prisma/client";

@Injectable()
export class PaymentScheduleService {
  constructor(private readonly prisma: PrismaService) {}

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
    if (!schedule)
      throw new NotFoundException(`Payment schedule with id ${id} not found`);
    return schedule;
  }

  async update(id: number, updatePaymentScheduleDto: UpdatePaymentScheduleDto) {
    return this.prisma.payment_schedule.update({
      where: { id },
      data: updatePaymentScheduleDto,
    });
  }

  async remove(id: number) {
    return this.prisma.payment_schedule.delete({ where: { id } });
  }

  async getByContractId(contractId: number) {
    const schedules = await this.prisma.payment_schedule.findMany({
      where: { contract_id: contractId },
      orderBy: { due_date: "asc" },
    });
    if (!schedules.length) {
      throw new NotFoundException(
        `No payment schedules found for contract ${contractId}`
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
        `No payment schedules found for contract ${contractId} with status "${status}"`
      );
    }
    return schedules;
  }

  async getByBuyerIdAndStatus(buyerId: number, status?: PaymentStatus) {
    const contracts = await this.prisma.contracts.findMany({
      where: { buyer_id: buyerId },
      select: { id: true },
    });

    if (!contracts.length)
      throw new NotFoundException(`No contracts found for buyer ${buyerId}`);

    const whereClause: any = {
      contract_id: { in: contracts.map((c) => c.id) },
    };
    if (status) whereClause.status = status;

    const schedules = await this.prisma.payment_schedule.findMany({
      where: whereClause,
      orderBy: { due_date: "asc" },
    });

    if (!schedules.length)
      throw new NotFoundException(
        `No payment schedules found for buyer ${buyerId}${status ? ` with status ${status}` : ""}`
      );

    return schedules;
  }
}
