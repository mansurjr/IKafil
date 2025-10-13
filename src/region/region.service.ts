import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";
import { message } from "telegraf/filters";

@Injectable()
export class RegionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRegionDto: CreateRegionDto) {
    return this.prisma.region.create({
      data: createRegionDto,
    });
  }

  async findAll() {
    return this.prisma.region.findMany({
      orderBy: { id: "asc" },
    });
  }

  async findOne(id: number) {
    const region = await this.prisma.region.findUnique({
      where: { id },
    });
    if (!region) throw new NotFoundException(`Region with ID ${id} not found`);
    return region;
  }

  async update(id: number, updateRegionDto: UpdateRegionDto) {
    await this.findOne(id);
    return this.prisma.region.update({
      where: { id },
      data: updateRegionDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.region.delete({
      where: { id },
    });
    return { message: "Region deleted successfully" };
  }
}
