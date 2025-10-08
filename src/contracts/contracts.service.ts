import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContractDto) {
    const { buyer_id, device_id, admin_id, plan_id, trade_in_id } = dto;

    const buyer = await this.prisma.users.findUnique({
      where: { id: buyer_id },
    });
    if (!buyer)
      throw new BadRequestException(`Buyer with ID ${buyer_id} not found`);

    const device = await this.prisma.devices.findUnique({
      where: { id: device_id },
    });
    if (!device)
      throw new BadRequestException(`Device with ID ${device_id} not found`);

    if (admin_id) {
      const admin = await this.prisma.users.findUnique({
        where: { id: admin_id },
      });
      if (!admin)
        throw new BadRequestException(`Admin with ID ${admin_id} not found`);
    }

    if (plan_id) {
      const plan = await this.prisma.payment_schedule.findUnique({
        where: { id: plan_id },
      });
      if (!plan)
        throw new BadRequestException(`Plan with ID ${plan_id} not found`);
    }

    if (trade_in_id) {
      const tradeIn = await this.prisma.trade_in_requests.findUnique({
        where: { id: trade_in_id },
      });
      if (!tradeIn)
        throw new BadRequestException(
          `Trade-in with ID ${trade_in_id} not found`
        );
    }

    return this.prisma.contracts.create({
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
        status: dto.status,
        start_date: dto.start_date,
        end_date: dto.end_date,
        is_trade_in: dto.is_trade_in,
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

  async contractVerify(id: number) {
    const total = await this.prisma.payments.aggregate({
      where: { contract_id: id },
      _sum: { amount: true },
    });

    const totalAmount = total._sum.amount || 0;

    const updatedContract = this.prisma.contracts.update({
      where: { id },
      data: {
        total_price: `${total}`,
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
