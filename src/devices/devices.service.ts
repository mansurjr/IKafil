import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto) {
    return this.prisma.devices.create({
      data: createDeviceDto,
    });
  }

  async findAll() {
    return this.prisma.devices.findMany();
  }

  async findOne(id: number) {
    return this.prisma.devices.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    return this.prisma.devices.update({
      where: { id },
      data: updateDeviceDto,
    });
  }

  async remove(id: number) {
    return this.prisma.devices.delete({
      where: { id },
    });
  }
}
