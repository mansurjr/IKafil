import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DevicesService } from "../devices/devices.service";
import { InstallmentPlansService } from "../installment-plans/installment-plans.service";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deviceService: DevicesService,
    private readonly planService: InstallmentPlansService,
    private readonly notification: NotificationsService
  ) { }

  private async validateEntity(
    model: keyof PrismaService,
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
    const {
      buyer_id,
      device_id,
      admin_id,
      plan_id,
      trade_in_value,
      is_trade_in,
    } = dto;

    await this.validateEntity("users", buyer_id, "Buyer");
    await this.validateEntity("devices", device_id, "Device");
    if (admin_id) await this.validateEntity("users", admin_id, "Admin");
    if (plan_id)
      await this.validateEntity("installment_plans", plan_id, "Plan");

    const device = await this.deviceService.findOne(device_id);
    const plan = await this.planService.findOne(plan_id!);

    const base_price = Number(device.base_price);
    const months = Number(plan.months);
    const percent = Number(plan.percent);

    let adjusted_price = base_price;
    if (is_trade_in && trade_in_value && trade_in_value > 0) {
      adjusted_price -= trade_in_value;
      if (adjusted_price < 0) adjusted_price = 0;
    }

    const total_price = adjusted_price * (1 + percent / 100);

    const initial_payment = is_trade_in ? 0 : total_price * 0.2;

    const remaining_balance = total_price - initial_payment;
    const monthly_payment =
      months > 0 ? remaining_balance / months : remaining_balance;

    const startDate = new Date(dto.start_date ?? new Date());
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    return this.prisma.$transaction(async (tx) => {
      const contract = await tx.contracts.create({
        data: {
          buyer_id,
          device_id,
          admin_id,
          plan_id,
          total_price,
          initial_payment,
          monthly_payment,
          remaining_balance,
          duration_months: months,
          status: dto.status ?? "active",
          start_date: startDate,
          end_date: endDate,
          is_trade_in: is_trade_in ?? false,
          trade_in_value: trade_in_value ?? 0,
        },
      });

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

      if (!is_trade_in) {
        await tx.payments.create({
          data: {
            contract_id: contract.id,
            amount: initial_payment,
            method: PaymentMethod.cash,
            status: PaymentStatus.paid,
            payment_date: new Date(),
          },
        });
      }

      await tx.devices.update({
        where: { id: device_id },
        data: { status: "sold" },
      });

      await this.notification.sendViaSMS({
        reciever_id: contract.buyer_id,
        message: `Your ${device.name} device has been sold for ${total_price} so'm.`
      })
      await this.notification.sendViaSMS({
        reciever_id: contract.buyer_id,
        message: `Contract created successfully for ${device.name} device.`
      })

      return {
        message: "✅ Contract created successfully",
        contract_id: contract.id,
        total_price,
        adjusted_price,
        initial_payment,
        monthly_payment,
        months,
        percent,
        trade_in_applied: is_trade_in ?? false,
        trade_in_value: trade_in_value ?? 0,
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
    if (!contract)
      throw new NotFoundException(`Contract with ID ${id} not found`);
    return contract;
  }

  async update(id: number, dto: UpdateContractDto) {
    const existing = await this.prisma.contracts.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException(`Contract with ID ${id} not found`);

    return this.prisma.contracts.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.contracts.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException(`Contract with ID ${id} not found`);

    await this.prisma.contracts.delete({ where: { id } });
    return { message: `Contract with ID ${id} deleted successfully` };
  }
}
