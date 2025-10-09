import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";

@Injectable()
export class RegionService {
  constructor(private prisma: PrismaService) {}

  async create(createRegionDto: CreateRegionDto) {
    return this.prisma.region.create({
      data: {
        name: createRegionDto.name,
      },
    });
  }

  async findAll() {
    return this.prisma.region.findMany({
      include: {
        users: true,
        devices: true,
      },
    });
  }

  async findOne(id: number) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: { users: true, devices: true },
    });
    if (!region) throw new NotFoundException(`Region #${id} not found`);
    return region;
  }

  async update(id: number, updateRegionDto: UpdateRegionDto) {
    return this.prisma.region.update({
      where: { id },
      data: {
        name: updateRegionDto.name,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.region.delete({
      where: { id },
    });
  }
}
