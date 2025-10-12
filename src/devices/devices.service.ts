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

  async create(
    createDeviceDto: CreateDeviceDto,
    files?: Express.Multer.File[]
  ) {
    const { details, ...deviceData } = createDeviceDto;

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

    if (
      (deviceData.sale_type === SaleType.seller_sold ||
        deviceData.sale_type === SaleType.trade_in) &&
      !deviceData.seller_id
    ) {
      throw new BadRequestException(
        "seller_id is required for trade_in or seller_sold devices"
      );
    }

    const data: Prisma.devicesCreateInput | Prisma.devicesUncheckedCreateInput =
      {
        ...deviceData,
        details: details
          ? {
              create: details as Prisma.device_detailsCreateWithoutDevicesInput,
            }
          : undefined,
        device_images: imageData.length
          ? {
              create: imageData,
            }
          : undefined,
      };

    return this.prisma.devices.create({
      data: data as any,
      include: {
        details: true,
        device_images: true,
      },
    });
  }

  // async findFilteredDevices(filters?: { status?: DeviceStatus }) {
  //   return this.prisma.devices.findMany({
  //     where: {
  //       ...(filters?.status && { status: filters.status }),
  //     },
  //     include: {
  //       seller: true,
  //     },
  //   });
  // }
  async findAll(search?: string, page?: number, limit?: number) {
    const safePage = Number(page) && page! > 0 ? page! : 1;
    const number_limit = Number(limit) && limit! > 0 ? limit! : 10;
    const skip = (safePage - 1) * number_limit;

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
      select: {
        id: true,
        name: true,
        type: true,
        sale_type: true,
        status: true,
        seller_id: true,
        region_id: true,
        base_price: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        device_images: true,
      },
      orderBy: { created_at: "desc" },
      skip,
      take: number_limit,
    });

    return {
      total,
      page: safePage,
      limit: number_limit,
      totalPages: Math.ceil(total / number_limit),
      data: devices,
    };
  }

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

    const imageData: Prisma.device_imagesCreateWithoutDeviceInput[] = [];

    if (files?.length) {
      const uploadPath = join(process.cwd(), "uploads", "devices");
      if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });

      for (const img of existing.device_images) {
        const fileName = img.url.split("/").pop();
        if (fileName) {
          const filePath = join(uploadPath, fileName);
          if (existsSync(filePath)) unlinkSync(filePath);
        }
      }

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

    const updateData:
      | Prisma.devicesUpdateInput
      | Prisma.devicesUncheckedUpdateInput = {
      ...deviceData,
      details: details
        ? {
            upsert: {
              create: details as Prisma.device_detailsCreateWithoutDevicesInput,
              update: details as Prisma.device_detailsUpdateWithoutDevicesInput,
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
    };

    return this.prisma.devices.update({
      where: { id },
      data: updateData as any,
      include: {
        details: true,
        device_images: true,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.devices.findUnique({
      where: { id },
      include: { details: true, device_images: true },
    });

    if (!existing) throw new NotFoundException("Device not found");

    if (existing.device_images?.length) {
      for (const img of existing.device_images) {
        try {
          const fileName = img.url.split("/").pop();
          if (fileName) {
            const filePath = join(
              process.cwd(),
              "uploads",
              "devices",
              fileName
            );
            if (existsSync(filePath)) unlinkSync(filePath);
          }
        } catch {}
      }

      await this.prisma.device_images.deleteMany({ where: { device_id: id } });
    }

    if (existing.details) {
      await this.prisma.device_details.delete({
        where: { id: existing.details.id },
      });
    }

    return this.prisma.devices.delete({ where: { id } });
  }
}
