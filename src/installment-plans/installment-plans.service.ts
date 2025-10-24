import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateInstallmentPlanDto } from "./dto/create-installment-plan.dto";
import { UpdateInstallmentPlanDto } from "./dto/update-installment-plan.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InstallmentPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInstallmentPlanDto: CreateInstallmentPlanDto) {
    return await this.prisma.installment_plans.create({
      data: createInstallmentPlanDto,
    });
  }

  async findAll() {
    return this.prisma.installment_plans.findMany();
  }

  async findOne(id: number) {
    const installment = await this.prisma.installment_plans.findUnique({
      where: { id },
      include: { contracts: true },
    });
    if (!installment) {
      throw new NotFoundException(`Installment plan ID:${id} not found`);
    }
    return installment;
  }

  async update(id: number, updateInstallmentPlanDto: UpdateInstallmentPlanDto) {
    const installment = await this.prisma.installment_plans.findUnique({
      where: { id },
    });
    if (!installment) {
      throw new NotFoundException(`Installment plan ID:${id} not found`);
    }
    return this.prisma.installment_plans.update({
      where: { id },
      data: updateInstallmentPlanDto,
    });
  }

  async remove(id: number) {
    const installment = await this.prisma.installment_plans.findUnique({
      where: { id },
    });
    if (!installment) {
      throw new NotFoundException(`Installment plan ID:${id} not found`);
    }
    await this.prisma.installment_plans.delete({ where: { id } });
    return { message: "Installement deleted successfully!" };
  }
}
