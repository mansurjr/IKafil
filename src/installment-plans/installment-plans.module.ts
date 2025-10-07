import { Module } from '@nestjs/common';
import { InstallmentPlansService } from './installment-plans.service';
import { InstallmentPlansController } from './installment-plans.controller';

@Module({
  controllers: [InstallmentPlansController],
  providers: [InstallmentPlansService],
})
export class InstallmentPlansModule {}
