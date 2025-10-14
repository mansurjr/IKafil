import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateInstallmentPlanDto } from "./dto/create-installment-plan.dto";
import { UpdateInstallmentPlanDto } from "./dto/update-installment-plan.dto";
import { PrismaService } from "../prisma/prisma.service";
import { QueryInstallmentPlanDto } from "./dto/query-installment-plan.dto";


@Injectable()
export class InstallmentPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInstallmentPlanDto: CreateInstallmentPlanDto) {
    return await this.prisma.installment_plans.create({
      data: createInstallmentPlanDto,
    });
  }

  async findAll(query: QueryInstallmentPlanDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = "months",
      sortOrder = "asc",
    } = query;

    const skip = (page - 1) * limit;

    return this.prisma.installment_plans.findMany({
      where: {
        months: query.months,
        percent: {
          gte: query.percent_gte,
          lte: query.percent_lte,
        },
        first_payment_percent: {
          gte: query.first_payment_percent_gte,
          lte: query.first_payment_percent_lte,
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });
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

  async getTopPlans(limit = 5) {
    return this.prisma.installment_plans.findMany({
      orderBy: { percent: "desc" },
      take: limit,
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return this.prisma.installment_plans.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { created_at: "desc" },
    });
  }
}