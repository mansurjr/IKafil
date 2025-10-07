import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstallmentPlansService } from './installment-plans.service';
import { CreateInstallmentPlanDto } from './dto/create-installment-plan.dto';
import { UpdateInstallmentPlanDto } from './dto/update-installment-plan.dto';

@Controller('installment-plans')
export class InstallmentPlansController {
  constructor(private readonly installmentPlansService: InstallmentPlansService) {}

  @Post()
  create(@Body() createInstallmentPlanDto: CreateInstallmentPlanDto) {
    return this.installmentPlansService.create(createInstallmentPlanDto);
  }

  @Get()
  findAll() {
    return this.installmentPlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.installmentPlansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstallmentPlanDto: UpdateInstallmentPlanDto) {
    return this.installmentPlansService.update(+id, updateInstallmentPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.installmentPlansService.remove(+id);
  }
}
