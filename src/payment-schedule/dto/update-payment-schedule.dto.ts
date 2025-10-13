import { PartialType } from '@nestjs/swagger';
import { CreatePaymentScheduleDto } from './create-payment-schedule.dto';

export class UpdatePaymentScheduleDto extends PartialType(CreatePaymentScheduleDto) {}
