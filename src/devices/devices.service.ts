import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";
import { DeviceStatus } from "@prisma/client";

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto) {
    const { details_id, seller_id, region_id } = createDeviceDto;

    if (details_id) {
      const detail = await this.prisma.device_details.findUnique({
        where: { id: details_id },
      });
      if (!detail)
        throw new BadRequestException(
          `Device Detail with ID ${details_id} not found`
        );
    }

    if (seller_id) {
      const seller = await this.prisma.users.findUnique({
        where: { id: seller_id },
      });
      if (!seller)
        throw new BadRequestException(`Seller with ID ${seller_id} not found`);
      if (seller.role !== "seller")
        throw new BadRequestException(
          "Seller ID is incorrect or the role is not seller"
        );
    }

    if (region_id) {
      const region = await this.prisma.region.findUnique({
        where: { id: region_id },
      });
      if (!region)
        throw new BadRequestException(`Region with ID ${region_id} not found`);
    }

    const duplicate = await this.prisma.devices.findFirst({
      where: {
        seller_id,
        details_id,
        status: { not: "sold" },
      },
    });
    if (duplicate)
      throw new BadRequestException("Seller already listed this device");

    return await this.prisma.devices.create({
      data: { ...createDeviceDto, region_id, seller_id, details_id },
    });
  }

  async findAll() {
    return this.prisma.devices.findMany({
      include: {
        carts: true,
        contracts: true,
        details: true,
        device_images: true,
        region: true,
        _count: { select: { device_images: true, contracts: true } },
        seller: true,
        trade_in_requests_new: true,
        trade_in_requests_old: true,
      },
    });
  }

  async findFilteredDevices(filters?: { status?: DeviceStatus }) {
    return this.prisma.devices.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        details: true,
        seller: true,
      },
    });
  }

  async findOne(id: number) {
    const device = await this.prisma.devices.findUnique({
      where: { id },
      include: {
        carts: true,
        contracts: true,
        details: true,
        device_images: true,
        region: true,
        seller: true,
        trade_in_requests_new: true,
        trade_in_requests_old: true,
      },
    });

    if (!device) throw new NotFoundException(`Device with ID ${id} not found`);
    return device;
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.prisma.devices.findUnique({ where: { id } });

    if (!device)
      throw new BadRequestException(`Device with ID ${id} not found`);
    if (device.status === "sold")
      throw new BadRequestException("This device is not available");

    if (updateDeviceDto.seller_id) {
      const seller = await this.prisma.users.findUnique({
        where: { id: updateDeviceDto.seller_id },
      });
      if (!seller)
        throw new BadRequestException(
          `Seller with ID ${updateDeviceDto.seller_id} not found`
        );
      if (seller.role !== "seller")
        throw new BadRequestException(
          `User with ID ${updateDeviceDto.seller_id} is not a seller`
        );
      if (updateDeviceDto.seller_id !== device.seller_id)
        throw new BadRequestException(
          "You cannot reassign this device to another seller"
        );
    }

    return this.prisma.devices.update({
      where: { id },
      data: updateDeviceDto,
    });
  }

  async remove(id: number) {
    const device = await this.prisma.devices.findUnique({ where: { id } });

    if (!device)
      throw new BadRequestException(`Device with ID ${id} not found`);
    if (device.status === "sold")
      throw new BadRequestException("Sold devices cannot be deleted");

    return this.prisma.devices.delete({
      where: { id },
    });
  }
}
