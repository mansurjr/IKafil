import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  async saveDeviceImage(data: {
    deviceId: number;
    url: string;
    mimetype: string;
    size: number;
  }) {
    const device = await this.prisma.devices.findUnique({
      where: { id: data.deviceId },
    });

    if (!device) {
      throw new NotFoundException("Device not found");
    }

    return await this.prisma.device_images.create({
      data: {
        device_id: data.deviceId,
        url: data.url,
      },
    });
  }
}
