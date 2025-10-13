import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateDeviceDetailDto } from "./dto/update-device-detail.dto";
import { CreateDeviceDetailDto } from "./dto/create-device-detail.dto";

@Injectable()
export class DeviceDetailsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(deviceId: number) {
    const device = await this.prisma.devices.findUnique({
      where: { id: deviceId },
      include: { details: true },
    });

    if (!device) throw new NotFoundException("Device not found");
    if (!device.details)
      throw new NotFoundException("Device details not found");

    return device.details;
  }

  async update(deviceId: number, updateDeviceDetailDto: CreateDeviceDetailDto) {
    const device = await this.prisma.devices.findUnique({
      where: { id: deviceId },
      include: { details: true },
    });

    if (!device) throw new NotFoundException("Device not found");

    if (device.details) {
      return this.prisma.device_details.update({
        where: { id: device.details.id },
        data: updateDeviceDetailDto,
      });
    } else {
      return this.prisma.device_details.create({
        data: {
          ...updateDeviceDetailDto,
          device: { connect: { id: deviceId } },
        },
      });
    }
  }
}
