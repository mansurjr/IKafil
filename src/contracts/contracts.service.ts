import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaClient } from "@prisma/client/extension";

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}
  private async validateEntity<T>(
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

    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Shartnomani yaratish
      const contract = await tx.contracts.create({
        data: {
          buyer_id,
          device_id,
          admin_id,
          plan_id,
          trade_in_id,
          total_price: dto.total_price,
          monthly_payment: dto.monthly_payment,
          duration_months: dto.duration_months,
          remaining_balance: dto.remaining_balance,
          status: dto.status ?? "active",
          start_date: dto.start_date ?? new Date(),
          end_date:
            dto.end_date ??
            new Date(
              new Date(dto.start_date ?? new Date()).setMonth(
                new Date(dto.start_date ?? new Date()).getMonth() +
                  dto.duration_months
              )
            ),
          is_trade_in: dto.is_trade_in ?? false,
        },
        include: {
          buyer: true,
          device: true,
          admin: true,
          plan: true,
          trade_in: true,
        },
      });

      // 2️⃣ Payment schedule yaratish
      const startDate = new Date(dto.start_date ?? new Date());
      const schedules: {
        contract_id: number;
        due_date: Date;
        amount_due: number;
        status: "pending";
      }[] = [];

      for (let i = 0; i < dto.duration_months; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        schedules.push({
          contract_id: contract.id,
          due_date: dueDate,
          amount_due: Number(dto.monthly_payment),
          status: "pending",
        });
      }

      await tx.payment_schedule.createMany({
        data: schedules,
      });

      // 3️⃣ Har oy uchun payment yozuvlari ham yaratiladi
      const paymentsData: {
        contract_id: number;
        amount: number;
        method: "cash";
        status: "pending";
        payment_date: Date;
      }[] = schedules.map((s) => ({
        contract_id: contract.id,
        amount: Number(dto.monthly_payment),
        method: "cash",
        status: "pending",
        payment_date: s.due_date,
      }));

      await tx.payments.createMany({
        data: paymentsData,
      });

      // 4️⃣ Natijani qaytarish (hammasi bilan birga)
      const fullContract = await tx.contracts.findUnique({
        where: { id: contract.id },
        include: {
          buyer: true,
          device: true,
          admin: true,
          plan: true,
          trade_in: true,
          payment_schedule: true,
          payments: true,
        },
      });

      return fullContract;
    });
  }

  async contractVerify(id: number) {
    const total = await this.prisma.payments.aggregate({
      where: { contract_id: id },
      _sum: { amount: true },
    });

    // const totalMonth = await this.prisma.payment_schedule.aggregate({
    //   where: { contract_id: id },
    //   _sum: { paid_amount: true },
    // });

    const totalAmount = total._sum.amount || 0 || "";
    // const totalMonthAmount = totalMonth._sum.paid_amount || 0 || "";

    const updatedContract = this.prisma.contracts.update({
      where: { id },
      data: {
        total_price: `${totalAmount}`,
        updated_at: new Date(),
        // monthly_payment: `${totalMonthAmount}`,
      },
      include: {
        buyer: true,
        device: true,
        admin: true,
        plan: true,
        trade_in: true,
        payment_schedule: true,
        payments: true,
      },
    });

    return updatedContract;
  }

  async findAll() {
    return this.prisma.contracts.findMany({
      include: {
        buyer: true,
        device: true,
        admin: true,
        plan: true,
        trade_in: true,
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
        trade_in: true,
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
        trade_in: true,
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
