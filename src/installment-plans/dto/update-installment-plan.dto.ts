import { PartialType } from '@nestjs/swagger';
import { CreateInstallmentPlanDto } from './create-installment-plan.dto';

export class UpdateInstallmentPlanDto extends PartialType(CreateInstallmentPlanDto) {}
