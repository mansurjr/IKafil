import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTradeInDto } from "./dto/create-trade-in.dto";
import { UpdateTradeInDto } from "./dto/update-trade-in.dto";

@Injectable()
export class TradeInService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTradeInDto) {
    const [seller, oldDevice, newDevice] = await Promise.all([
      this.prisma.users.findUnique({ where: { id: dto.seller_id } }),
      this.prisma.devices.findUnique({ where: { id: dto.old_device_id } }),
      this.prisma.devices.findUnique({ where: { id: dto.new_device_id } }),
    ]);

    if (!seller) throw new NotFoundException("Seller not found");
    if (!oldDevice) throw new NotFoundException("Old device not found");
    if (!newDevice) throw new NotFoundException("New device not found");

    return this.prisma.trade_in_requests.create({
      data: {
        seller_id: dto.seller_id,
        old_device_id: dto.old_device_id,
        new_device_id: dto.new_device_id,
        estimated_value: dto.estimated_value,
        approved: dto.approved ?? false,
        difference_amount: dto.difference_amount ?? null,
      },
      include: {
        seller: true,
        old_device: true,
        new_device: true,
      },
    });
  }

  async findAll() {
    return this.prisma.trade_in_requests.findMany({
      include: {
        seller: true,
        old_device: true,
        new_device: true,
      },
    });
  }

  async findOne(id: number) {
    const tradeIn = await this.prisma.trade_in_requests.findUnique({
      where: { id },
      include: {
        seller: true,
        old_device: true,
        new_device: true,
      },
    });

    if (!tradeIn) throw new NotFoundException("Trade-in request not found");
    return tradeIn;
  }

  async update(id: number, dto: UpdateTradeInDto) {
    const tradeIn = await this.prisma.trade_in_requests.findUnique({
      where: { id },
    });
    if (!tradeIn) throw new NotFoundException("Trade-in request not found");

    return this.prisma.trade_in_requests.update({
      where: { id },
      data: dto,
      include: {
        seller: true,
        old_device: true,
        new_device: true,
      },
    });
  }

  async remove(id: number) {
    const tradeIn = await this.prisma.trade_in_requests.findUnique({
      where: { id },
    });
    if (!tradeIn) throw new NotFoundException("Trade-in request not found");

    return this.prisma.trade_in_requests.delete({ where: { id } });
  }
}
