import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentScheduleService } from './payment-schedule.service';
import { CreatePaymentScheduleDto } from './dto/create-payment-schedule.dto';
import { UpdatePaymentScheduleDto } from './dto/update-payment-schedule.dto';

@Controller('payment-schedule')
export class PaymentScheduleController {
  constructor(private readonly paymentScheduleService: PaymentScheduleService) {}

  @Post()
  create(@Body() createPaymentScheduleDto: CreatePaymentScheduleDto) {
    return this.paymentScheduleService.create(createPaymentScheduleDto);
  }

  @Get()
  findAll() {
    return this.paymentScheduleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentScheduleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentScheduleDto: UpdatePaymentScheduleDto) {
    return this.paymentScheduleService.update(+id, updatePaymentScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentScheduleService.remove(+id);
  }
}
