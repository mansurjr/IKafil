import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeviceDetailDto } from "./dto/create-device-detail.dto";
import { UpdateDeviceDetailDto } from "./dto/update-device-detail.dto";

@Injectable()
export class DeviceDetailsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceDetailDto: CreateDeviceDetailDto) {
    return this.prisma.device_details.create({
      data: createDeviceDetailDto,
    });
  }

  async findAll() {
    return this.prisma.device_details.findMany({ include: { devices: true } });
  }

  async findOne(id: number) {
    return this.prisma.device_details.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateDeviceDetailDto: UpdateDeviceDetailDto) {
    return this.prisma.device_details.update({
      where: { id },
      data: updateDeviceDetailDto,
    });
  }

  async remove(id: number) {
    return this.prisma.device_details.delete({
      where: { id },
    });
  }
}
