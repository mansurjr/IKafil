import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaClient } from "@prisma/client/extension";
import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { DevicesService } from "../devices/devices.service";
import { InstallmentPlansService } from "../installment-plans/installment-plans.service";

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deviceService: DevicesService,
    private readonly planService: InstallmentPlansService
  ) {}

  private async validateEntity(
    model: keyof PrismaClient,
    id: number,
    entityName: string
  ) {
    const record = await this.prisma[model].findUnique({ where: { id } });
    if (!record) {
      throw new BadRequestException(`${entityName} with ID ${id} not found`);
    }
    return record;
  }

  async create(dto: CreateContractDto) {
    const { buyer_id, device_id, admin_id, plan_id, trade_in_id } = dto;

    await this.validateEntity("users", buyer_id, "Buyer");
    await this.validateEntity("devices", device_id, "Device");
    if (admin_id) await this.validateEntity("users", admin_id, "Admin");
    if (plan_id)
      await this.validateEntity("installment_plans", plan_id, "Plan");
    if (trade_in_id)
      await this.validateEntity("trade_in_requests", trade_in_id, "Trade-in");

    const device = await this.deviceService.findOne(device_id);
    const plan = await this.planService.findOne(plan_id!);

    if (!device || !plan) {
      throw new BadRequestException("Device yoki Plan topilmadi");
    }

    const base_price = Number(device.base_price);
    const months = Number(plan.months);
    const percent = Number(plan.percent);
    let initial_payment = 0;
    let total_price = base_price

    // 🧮 Hisoblash formulalari
    if (!dto.is_trade_in) {
      total_price = base_price * (1 + percent / 100);
      initial_payment = total_price / (months + 1);
    }
    
    const monthly_payment = total_price / months;
    const remaining_balance = total_price - initial_payment;

    return this.prisma.$transaction(async (tx) => {
      const contract = await tx.contracts.create({
        data: {
          buyer_id,
          device_id,
          admin_id,
          plan_id,
          total_price,
          monthly_payment,
          duration_months: months,
          remaining_balance,
          initial_payment,
          status: dto.status ?? "active",
          start_date: dto.start_date ?? new Date(),
          end_date:
            dto.end_date ??
            new Date(
              new Date(dto.start_date ?? new Date()).setMonth(
                new Date(dto.start_date ?? new Date()).getMonth() + months
              )
            ),
          is_trade_in: dto.is_trade_in ?? false,
        },
      });

      const startDate = new Date(dto.start_date ?? new Date());
      const schedules: Prisma.payment_scheduleCreateManyInput[] = [];

      for (let i = 0; i < months; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + (i + 1));

        schedules.push({
          contract_id: contract.id,
          due_date: dueDate,
          amount_due: monthly_payment,
          status: PaymentStatus.pending,
        });
      }

      await tx.payment_schedule.createMany({ data: schedules });

      const paymentsData: Prisma.paymentsCreateManyInput[] = [
        {
          contract_id: contract.id,
          amount: initial_payment,
          method: PaymentMethod.cash,
          status: PaymentStatus.paid,
          payment_date: new Date(),
        },
        ...schedules.map((s) => ({
          contract_id: contract.id,
          amount: monthly_payment,
          method: PaymentMethod.cash,
          status: PaymentStatus.pending,
          payment_date: s.due_date,
        })),
      ];

      await tx.payments.createMany({ data: paymentsData });

      return {
        message: "✅ Contract created successfully with initial payment",
        contract_id: contract.id,
        total_price,
        initial_payment,
        monthly_payment,
        months,
        percent,
      };
    });
  }

  async findAll() {
    return this.prisma.contracts.findMany({
      include: {
        buyer: true,
        device: true,
        admin: true,
        plan: true,
        payment_schedule: true,
        payments: true,
      },
      orderBy: { created_at: "desc" },
    });
  }

  async findOne(id: number) {
    const contract = await this.prisma.contracts.findUnique({
      where: { id },
      include: {
        buyer: true,
        device: true,
        admin: true,
        plan: true,
        payment_schedule: true,
        payments: true,
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  async update(id: number, dto: UpdateContractDto) {
    const existing = await this.prisma.contracts.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return this.prisma.contracts.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
      include: {
        buyer: true,
        device: true,
        admin: true,
        plan: true,
        payment_schedule: true,
        payments: true,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.contracts.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    await this.prisma.contracts.delete({ where: { id } });
    return { message: `Contract with ID ${id} deleted successfully` };
  }
}
