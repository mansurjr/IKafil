import { Injectable } from '@nestjs/common';
import { CreateTradeInDto } from './dto/create-trade-in.dto';
import { UpdateTradeInDto } from './dto/update-trade-in.dto';

@Injectable()
export class TradeInService {
  create(createTradeInDto: CreateTradeInDto) {
    return 'This action adds a new tradeIn';
  }

  findAll() {
    return `This action returns all tradeIn`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tradeIn`;
  }

  update(id: number, updateTradeInDto: UpdateTradeInDto) {
    return `This action updates a #${id} tradeIn`;
  }

  remove(id: number) {
    return `This action removes a #${id} tradeIn`;
  }
}
