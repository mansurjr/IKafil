import { Injectable } from '@nestjs/common';
import { CreateInstallmentPlanDto } from './dto/create-installment-plan.dto';
import { UpdateInstallmentPlanDto } from './dto/update-installment-plan.dto';

@Injectable()
export class InstallmentPlansService {
  create(createInstallmentPlanDto: CreateInstallmentPlanDto) {
    return 'This action adds a new installmentPlan';
  }

  findAll() {
    return `This action returns all installmentPlans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} installmentPlan`;
  }

  update(id: number, updateInstallmentPlanDto: UpdateInstallmentPlanDto) {
    return `This action updates a #${id} installmentPlan`;
  }

  remove(id: number) {
    return `This action removes a #${id} installmentPlan`;
  }
}
