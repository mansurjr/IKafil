import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";
import { Express } from "express";
const { v4: uuidv4 } = require("uuid");
import { join } from "path";
import { writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { DeviceStatus, DeviceType, Prisma, SaleType } from "@prisma/client";
import sharp from "sharp";

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  /** 🔧 Utility: compress & save an image */
  private async compressAndSaveImage(
    file: Express.Multer.File,
    outputPath: string
  ) {
    try {
      await sharp(file.buffer)
        .resize(1200, 1200, { fit: "inside" })
        .jpeg({ quality: 75 })
        .toFile(outputPath);
    } catch (err) {
      console.error("Image compression failed:", err);
      throw new BadRequestException("Failed to compress image");
    }
  }

  /** 🆕 Create device + details + images */
  async create(
    createDeviceDto: CreateDeviceDto,
    files?: Express.Multer.File[]
  ) {
    const { details, ...deviceData } = createDeviceDto;

    // ✅ Validate seller requirement
    if (
      (deviceData.sale_type === SaleType.seller_sold ||
        deviceData.sale_type === SaleType.trade_in) &&
      !deviceData.seller_id
    ) {
      throw new BadRequestException(
        "seller_id is required for trade_in or seller_sold devices"
      );
    }

    // ✅ Handle file uploads
    const imageData: Prisma.device_imagesCreateWithoutDeviceInput[] = [];

    if (files?.length) {
      const uploadPath = join(process.cwd(), "uploads", "devices");
      if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.originalname.includes(".")
          ? file.originalname.substring(file.originalname.lastIndexOf("."))
          : ".jpg";
        const fileName = `${uuidv4()}${ext}`;
        const filePath = join(uploadPath, fileName);

        if (file.buffer) {
          await this.compressAndSaveImage(file, filePath);
        }

        imageData.push({
          url: `/uploads/devices/${fileName}`,
          is_primary: i === 0,
        });
      }
    }

    return this.prisma.devices.create({
      data: {
        ...deviceData,
        details: details
          ? {
              create: details as Prisma.device_detailsCreateWithoutDeviceInput,
            }
          : undefined,
        device_images: imageData.length
          ? {
              create: imageData,
            }
          : undefined,
      },
      include: {
        details: true,
        device_images: true,
      },
    });
  }

  /** 📋 Get all devices (with search + pagination) */
  async findAll(search?: string, page = 1, limit = 10) {
    const safePage = Number(page) && page > 0 ? Number(page) : 1;
    const numberLimit = Number(limit) && limit > 0 ? Number(limit) : 10;
    const skip = (safePage - 1) * numberLimit;

    const filter: Prisma.devicesWhereInput[] = [];
    const device_type = Object.values(DeviceType);
    const sale_type = Object.values(SaleType);
    const device_status = Object.values(DeviceStatus);

    if (search) {
      filter.push({
        name: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      });

      if (device_type.includes(search as DeviceType)) {
        filter.push({ type: { equals: search as DeviceType } });
      }

      if (sale_type.includes(search as SaleType)) {
        filter.push({ sale_type: { equals: search as SaleType } });
      }

      if (device_status.includes(search as DeviceStatus)) {
        filter.push({ status: { equals: search as DeviceStatus } });
      }
    }

    const conditions = filter.length ? { OR: filter } : {};

    const total = await this.prisma.devices.count({ where: conditions });

    const devices = await this.prisma.devices.findMany({
      where: conditions,
      include: {
        details: true,
        device_images: true,
      },
      orderBy: { created_at: "desc" },
      skip,
      take: numberLimit,
    });

    return {
      total,
      page: safePage,
      limit: numberLimit,
      totalPages: Math.ceil(total / numberLimit),
      data: devices,
    };
  }

  /** 🔍 Get one device by ID */
  async findOne(id: number) {
    const device = await this.prisma.devices.findUnique({
      where: { id },
      include: {
        details: true,
        device_images: true,
      },
    });

    if (!device) throw new NotFoundException("Device not found");
    return device;
  }

  /** ✏️ Update device + details + replace images */
  async update(
    id: number,
    updateDeviceDto: UpdateDeviceDto,
    files?: Express.Multer.File[]
  ) {
    const { details, ...deviceData } = updateDeviceDto;

    const existing = await this.prisma.devices.findUnique({
      where: { id },
      include: { details: true, device_images: true },
    });
    if (!existing) throw new NotFoundException("Device not found");

    const uploadPath = join(process.cwd(), "uploads", "devices");
    const imageData: Prisma.device_imagesCreateWithoutDeviceInput[] = [];

    // ✅ Delete old images if new files uploaded
    if (files?.length) {
      if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });

      // Remove old files
      for (const img of existing.device_images) {
        const fileName = img.url.split("/").pop();
        if (fileName) {
          const filePath = join(uploadPath, fileName);
          if (existsSync(filePath)) unlinkSync(filePath);
        }
      }

      // Add new images
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.originalname.includes(".")
          ? file.originalname.substring(file.originalname.lastIndexOf("."))
          : ".jpg";
        const fileName = `${uuidv4()}${ext}`;
        const filePath = join(uploadPath, fileName);

        if (file.buffer) {
          await this.compressAndSaveImage(file, filePath);
        }

        imageData.push({
          url: `/uploads/devices/${fileName}`,
          is_primary: i === 0,
        });
      }
    }

    return this.prisma.devices.update({
      where: { id },
      data: {
        ...deviceData,
        details: details
          ? {
              upsert: {
                create:
                  details as Prisma.device_detailsCreateWithoutDeviceInput,
                update:
                  details as Prisma.device_detailsCreateWithoutDeviceInput,
              },
            }
          : undefined,
        device_images:
          imageData.length > 0
            ? {
                deleteMany: {},
                create: imageData,
              }
            : undefined,
      },
      include: {
        details: true,
        device_images: true,
      },
    });
  }

  /** 🗑️ Delete device + images + details */
  async remove(id: number) {
    const existing = await this.prisma.devices.findUnique({
      where: { id },
      include: { details: true, device_images: true },
    });

    if (!existing) throw new NotFoundException("Device not found");

    // Delete image files
    const uploadPath = join(process.cwd(), "uploads", "devices");
    for (const img of existing.device_images) {
      const fileName = img.url.split("/").pop();
      if (fileName) {
        const filePath = join(uploadPath, fileName);
        if (existsSync(filePath)) unlinkSync(filePath);
      }
    }

    await this.prisma.device_images.deleteMany({ where: { device_id: id } });

    if (existing.details) {
      await this.prisma.device_details.delete({
        where: { id: existing.details.id },
      });
    }

    return this.prisma.devices.delete({ where: { id } });
  }
}
