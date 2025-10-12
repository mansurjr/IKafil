import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, contracts, payments, devices } from "@prisma/client";

type DeviceStatusKey = "published" | "pending" | "rejected" | "sold";

@Injectable()
export class BotService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}


  async getBuyerContracts(buyerId: number, take = 10, skip = 0) {
    if (!buyerId) throw new BadRequestException("buyerId is required");

    const contracts = await this.prisma.contracts.findMany({
      where: { buyer_id: buyerId },
      include: {
        device: {
          select: { id: true, name: true, base_price: true, status: true },
        },
        payments: {
          orderBy: { payment_date: "desc" },
          take: 5,
        },
      },
      orderBy: { created_at: "desc" },
      take,
      skip,
    });

    return contracts.map((c) => ({
      id: c.id,
      contractNumber: c.contract_number,
      device: c.device ? { id: c.device.id, name: c.device.name } : null,
      totalPrice: c.total_price.toString(),
      monthlyPayment: c.monthly_payment.toString(),
      durationMonths: c.duration_months,
      remainingBalance: c.remaining_balance.toString(),
      status: c.status,
      createdAt: c.created_at,
      recentPayments: c.payments.map((p) => ({
        id: p.id,
        amount: p.amount.toString(),
        date: p.payment_date,
        status: p.status,
      })),
    }));
  }

  async getBuyerPayments(buyerId: number, take = 20, skip = 0) {
    if (!buyerId) throw new BadRequestException("buyerId is required");

    const paymentsList = await this.prisma.payments.findMany({
      where: {
        contract: {
          buyer_id: buyerId,
        },
      },
      include: {
        contract: {
          select: { id: true, contract_number: true, device_id: true },
        },
      },
      orderBy: { payment_date: "desc" },
      take,
      skip,
    });

    return paymentsList.map((p) => ({
      id: p.id,
      contractId: p.contract_id,
      contractNumber: p.contract?.contract_number ?? null,
      amount: p.amount.toString(),
      date: p.payment_date,
      method: p.method,
      status: p.status,
    }));
  }

  async getContractPaymentSchedule(contractId: number) {
    if (!contractId) throw new BadRequestException("contractId is required");

    const schedule = await this.prisma.payment_schedule.findMany({
      where: { contract_id: contractId },
      orderBy: { due_date: "asc" },
    });

    if (!schedule || schedule.length === 0) return { contractId, schedule: [] };

    return {
      contractId,
      schedule: schedule.map((s) => ({
        id: s.id,
        dueDate: s.due_date,
        amountDue: s.amount_due.toString(),
        paidAmount: s.paid_amount ? s.paid_amount.toString() : null,
        status: s.status,
      })),
    };
  }

  async getSellerDevices(
    sellerId: number,
    status?: DeviceStatusKey,
    take = 20,
    skip = 0
  ) {
    if (!sellerId) throw new BadRequestException("sellerId is required");

    const prismaStatus = this.mapDeviceStatusKey(status);

    const whereClause: Prisma.devicesWhereInput = {
      seller_id: sellerId,
      ...(prismaStatus ? { status: prismaStatus } : {}),
    };

    const items = await this.prisma.devices.findMany({
      where: whereClause,
      include: {
        details: true,
        device_images: true,
        region: true,
      },
      orderBy: { created_at: "desc" },
      take,
      skip,
    });

    return items.map((d) => this.formatDeviceForBot(d));
  }

  async getSellerDeviceCounts(sellerId: number) {
    if (!sellerId) throw new BadRequestException("sellerId is required");

    const statuses = [
      "pending_approval",
      "approved",
      "rejected",
      "sold",
    ] as const;

    const counts = await Promise.all(
      statuses.map(async (st) => {
        const cnt = await this.prisma.devices.count({
          where: { seller_id: sellerId, status: st },
        });
        return { status: st, count: cnt };
      })
    );

    return {
      published: counts.find((c) => c.status === "approved")?.count ?? 0,
      pending: counts.find((c) => c.status === "pending_approval")?.count ?? 0,
      rejected: counts.find((c) => c.status === "rejected")?.count ?? 0,
      sold: counts.find((c) => c.status === "sold")?.count ?? 0,
    };
  }

  async getDeviceDetails(deviceId: number) {
    if (!deviceId) throw new BadRequestException("deviceId is required");

    const device = await this.prisma.devices.findUnique({
      where: { id: deviceId },
      include: {
        details: true,
        device_images: true,
        seller: { select: { id: true, username: true, email: true } },
        region: true,
      },
    });

    if (!device) throw new NotFoundException("Device not found");

    return this.formatDeviceForBot(device);
  }

  async changeDeviceStatus(
    deviceId: number,
    status: devices["status"],
    reason?: string
  ) {
    if (!deviceId) throw new BadRequestException("deviceId is required");

    const device = await this.prisma.devices.findUnique({
      where: { id: deviceId },
    });
    if (!device) throw new NotFoundException("Device not found");

    const updated = await this.prisma.devices.update({
      where: { id: deviceId },
      data: { status, updated_at: new Date() },
    });

    try {
      if (device.seller_id) {
        await this.prisma.notifications.create({
          data: {
            user_id: device.seller_id,
            title: `Your device status changed`,
            message:
              `Device "${device.name}" status is now ${status}` +
              (reason ? `: ${reason}` : ""),
          },
        });
      }
    } catch {}

    return this.formatDeviceForBot(updated);
  }

  async getContractSummary(contractId: number) {
    if (!contractId) throw new BadRequestException("contractId is required");

    const contract = await this.prisma.contracts.findUnique({
      where: { id: contractId },
      include: {
        device: { select: { id: true, name: true } },
        payments: { orderBy: { payment_date: "desc" }, take: 5 },
        buyer: { select: { id: true, full_name: true, email: true } },
      },
    });

    if (!contract) throw new NotFoundException("Contract not found");

    return {
      id: contract.id,
      contractNumber: contract.contract_number,
      device: contract.device
        ? { id: contract.device.id, name: contract.device.name }
        : null,
      totalPrice: contract.total_price.toString(),
      monthlyPayment: contract.monthly_payment.toString(),
      durationMonths: contract.duration_months,
      remainingBalance: contract.remaining_balance.toString(),
      status: contract.status,
      recentPayments: contract.payments.map((p) => ({
        id: p.id,
        amount: p.amount.toString(),
        date: p.payment_date,
        status: p.status,
      })),
      buyer: contract.buyer
        ? { id: contract.buyer.id, fullName: contract.buyer.full_name }
        : null,
    };
  }

  private mapDeviceStatusKey(
    key?: DeviceStatusKey
  ): devices["status"] | undefined {
    if (!key) return undefined;
    switch (key) {
      case "published":
        return "approved";
      case "pending":
        return "pending_approval";
      case "rejected":
        return "rejected";
      case "sold":
        return "sold";
      default:
        return undefined;
    }
  }

  private formatDeviceForBot(
    d: devices & { details?: any; device_images?: any[]; region?: any }
  ) {
    return {
      id: d.id,
      name: d.name,
      type: d.type,
      saleType: d.sale_type,
      status: d.status,
      price: d.base_price.toString(),
      isActive: d.is_active,
      region: d.region ? { id: d.region.id, name: d.region.name } : null,
      details: d.details
        ? {
            color: d.details.color,
            year: d.details.year,
            ram: d.details.ram,
            storage: d.details.storage,
            cpu: d.details.cpu,
            displaySize: d.details.display_size,
            batteryHealth: d.details.battery_health,
            description: d.details.description,
          }
        : null,
      images: (d.device_images || []).map((img) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.is_primary,
      })),
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }
}
