import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TradeInService } from './trade-in.service';
import { CreateTradeInDto } from './dto/create-trade-in.dto';
import { UpdateTradeInDto } from './dto/update-trade-in.dto';

@Controller('trade-in')
export class TradeInController {
  constructor(private readonly tradeInService: TradeInService) {}

  @Post()
  create(@Body() createTradeInDto: CreateTradeInDto) {
    return this.tradeInService.create(createTradeInDto);
  }

  @Get()
  findAll() {
    return this.tradeInService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tradeInService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTradeInDto: UpdateTradeInDto) {
    return this.tradeInService.update(+id, updateTradeInDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tradeInService.remove(+id);
  }
}
