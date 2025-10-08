import { PartialType } from '@nestjs/swagger';
import { CreateTradeInDto } from './create-trade-in.dto';

export class UpdateTradeInDto extends PartialType(CreateTradeInDto) {}
