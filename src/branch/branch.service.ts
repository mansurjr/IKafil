import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    const branch = await this.prisma.branch.create({
      data: createBranchDto,
      include: { region: true },
    });

    return {
      message: "Branch successfully created",
      data: branch,
    };
  }

  async findAll() {
    const branches = await this.prisma.branch.findMany({
      include: { region: true },
      orderBy: { id: "asc" },
    });

    return {
      message: "List of all branches",
      count: branches.length,
      data: branches,
    };
  }

  async findOne(id: number) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: { region: true },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return {
      message: "Branch found",
      data: branch,
    };
  }

  async update(id: number, updateBranchDto: UpdateBranchDto) {
    const exists = await this.prisma.branch.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    const updated = await this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
      include: { region: true },
    });

    return {
      message: "Branch successfully updated",
      data: updated,
    };
  }

  async remove(id: number) {
    const exists = await this.prisma.branch.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    await this.prisma.branch.delete({ where: { id } });

    return {
      message: "Branch successfully deleted",
    };
  }
}
