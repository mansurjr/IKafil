import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CreateDeviceImageDto } from "./dto/create-device-image.dto";
import { UpdateDeviceImageDto } from "./dto/update-device-image.dto";
import { PrismaService } from "../prisma/prisma.service";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuid } from "uuid";

@Injectable()
export class DeviceImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDeviceImageDto: CreateDeviceImageDto,
    file?: Express.Multer.File
  ) {
    const device = await this.prisma.devices.findUnique({
      where: { id: createDeviceImageDto.device_id },
    });

    if (!device) throw new NotFoundException("Device not found");
    if (!file) throw new BadRequestException("Image file is required");

    const filename = `${uuid()}${path.extname(file.originalname)}`;
    const uploadDir = path.join(__dirname, "../../uploads/devices");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadDir, filename), file.buffer);

    const imageUrl = `/uploads/devices/${filename}`;
    if (createDeviceImageDto.is_primary) {
      await this.prisma.device_images.updateMany({
        where: { device_id: createDeviceImageDto.device_id },
        data: { is_primary: false },
      });
    }

    return this.prisma.device_images.create({
      data: {
        url: imageUrl,
        device_id: createDeviceImageDto.device_id,
        is_primary: createDeviceImageDto.is_primary ?? false,
      },
    });
  }


  async getDeviceImagesById(deviceId: number) {
    const device = await this.prisma.devices.findUnique({
      where: { id: deviceId },
    });

    if (!device) throw new NotFoundException("Device not found");

    return this.prisma.device_images.findMany({
      where: { device_id: deviceId },
    });
  }


  async update(id: number, updateDeviceImageDto: UpdateDeviceImageDto) {
    const deviceImage = await this.prisma.device_images.findUnique({
      where: { id },
    });

    if (!deviceImage) throw new NotFoundException("Device image not found");

    if (updateDeviceImageDto.is_primary) {
      await this.prisma.device_images.updateMany({
        where: { device_id: deviceImage.device_id, NOT: { id } },
        data: { is_primary: false },
      });
    }

    return this.prisma.device_images.update({
      where: { id },
      data: updateDeviceImageDto,
    });
  }


  async remove(id: number) {
    const deviceImage = await this.prisma.device_images.findUnique({
      where: { id },
    });

    if (!deviceImage) throw new NotFoundException("Device image not found!");

    try {
      const filePath = path.join(
        __dirname,
        "../../uploads/devices",
        path.basename(deviceImage.url)
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.warn("Failed to delete local file:", err.message);
    }

    await this.prisma.device_images.delete({ where: { id } });
    return { message: "Device image deleted successfully!" };
  }


  async getTopImageDevices(limit = 5) {
    const allDevices = await this.prisma.devices.findMany({
      include: { device_images: true },
    });

    const sorted = allDevices
      .map((device) => ({
        ...device,
        imageCount: device.device_images.length,
      }))
      .sort((a, b) => b.imageCount - a.imageCount)
      .slice(0, limit);

    return sorted.map((d) => ({
      id: d.id,
      name: d.name,
      imageCount: d.imageCount,
      images: d.device_images,
    }));
  }
  

  async findDevicesWithoutImages() {
    const devices = await this.prisma.devices.findMany({
      include: { device_images: true },
    });

    return devices.filter((d) => d.device_images.length === 0);
  }
}
