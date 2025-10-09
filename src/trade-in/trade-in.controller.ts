import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { TradeInService } from "./trade-in.service";
import { CreateTradeInDto } from "./dto/create-trade-in.dto";
import { UpdateTradeInDto } from "./dto/update-trade-in.dto";
import { GetCurrentUser } from "../common/decorators/getCurrentUserid";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";

@ApiTags("Trade-In Requests")
@Controller("trade-in")
export class TradeInController {
  constructor(private readonly tradeInService: TradeInService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Yangi trade-in so‘rovi yaratish" })
  @ApiResponse({
    status: 201,
    description: "Trade-in muvaffaqiyatli yaratildi.",
  })
  @ApiResponse({ status: 404, description: "Seller yoki qurilma topilmadi." })
  create(
    @Body() createTradeInDto: CreateTradeInDto,
    @GetCurrentUser() userId: number
  ) {
    return this.tradeInService.create(createTradeInDto);
  }

  @Get()
  @ApiOperation({ summary: "Barcha trade-in so‘rovlarini olish" })
  @ApiResponse({
    status: 200,
    description: "Barcha trade-in so‘rovlar ro‘yxati.",
  })
  findAll() {
    return this.tradeInService.findAll();
  }
  // done
  @Get(":id")
  @ApiOperation({ summary: "Bitta trade-in so‘rovini ID orqali olish" })
  @ApiResponse({ status: 200, description: "Topilgan trade-in ma’lumotlari." })
  @ApiResponse({ status: 404, description: "Trade-in topilmadi." })
  findOne(@Param("id") id: string) {
    return this.tradeInService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Trade-in so‘rovini yangilash" })
  @ApiResponse({
    status: 200,
    description: "Trade-in muvaffaqiyatli yangilandi.",
  })
  @ApiResponse({ status: 404, description: "Trade-in topilmadi." })
  update(@Param("id") id: string, @Body() updateTradeInDto: UpdateTradeInDto) {
    return this.tradeInService.update(+id, updateTradeInDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Trade-in so‘rovini o‘chirish" })
  @ApiResponse({
    status: 200,
    description: "Trade-in muvaffaqiyatli o‘chirildi.",
  })
  @ApiResponse({ status: 404, description: "Trade-in topilmadi." })
  remove(@Param("id") id: string) {
    return this.tradeInService.remove(+id);
  }
}
