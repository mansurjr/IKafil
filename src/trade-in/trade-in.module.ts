import { Module } from '@nestjs/common';
import { TradeInService } from './trade-in.service';
import { TradeInController } from './trade-in.controller';

@Module({
  controllers: [TradeInController],
  providers: [TradeInService],
})
export class TradeInModule {}
