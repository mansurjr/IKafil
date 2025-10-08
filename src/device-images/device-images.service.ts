import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateDeviceImageDto } from "./dto/create-device-image.dto";
import { UpdateDeviceImageDto } from "./dto/update-device-image.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DeviceImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceImageDto: CreateDeviceImageDto) {
    const device = await this.prisma.device_images.findUnique({
      where: { id: createDeviceImageDto.device_id },
    });
    if (!device) {
      throw new NotFoundException("Device not found");
    }
    return this.prisma.device_images.create({
      data: {
        url: createDeviceImageDto.url,
        device_id: createDeviceImageDto.device_id,
        is_primary: createDeviceImageDto.is_primary,
      },
    });
  }

  findAll() {
    return this.prisma.device_images.findMany({
      include: {
        device: true,
      },
    });
  }

  async findOne(id: number) {
    const device_image = await this.prisma.device_images.findUnique({
      where: { id },
      include: { device: true },
    });

    if (!device_image) {
      throw new NotFoundException("Device image not found");
    }
    return device_image;
  }

  async update(id: number, updateDeviceImageDto: UpdateDeviceImageDto) {
    const device_image = await this.prisma.device_images.findUnique({
      where: { id },
      include: { device: true },
    });

    if (!device_image) {
      throw new NotFoundException("Device image not found");
    }
    return this.prisma.device_images.update({
      where: { id },
      data: updateDeviceImageDto,
    });
  }

  async remove(id: number) {
     const device_image = await this.prisma.device_images.findUnique({
       where: { id },
     });
    if (!device_image) {
      throw new NotFoundException("Device image not found!");
    }

    await this.prisma.device_images.delete({ where: { id } });
    return { message: "Device image deleted!" };
  }
}
