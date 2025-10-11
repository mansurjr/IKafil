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
import { JWT_Payoad } from "../jwt/jwt.service";
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
    @GetCurrentUser("id") seller_id: number
  ) {
    return this.tradeInService.create({ ...createTradeInDto, seller_id });
  }

  @Get()
  @ApiOperation({ summary: "Barcha trade-in so‘rovlarini olish" })
  findAll() {
    return this.tradeInService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Bitta trade-in so‘rovini ID orqali olish" })
  findOne(@Param("id") id: string) {
    return this.tradeInService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Trade-in so‘rovini yangilash" })
  update(@Param("id") id: string, @Body() updateTradeInDto: UpdateTradeInDto) {
    return this.tradeInService.update(+id, updateTradeInDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Trade-in so‘rovini o‘chirish" })
  remove(@Param("id") id: string) {
    return this.tradeInService.remove(+id);
  }

  @Patch(":id/approve")
  @ApiOperation({ summary: "Trade-in so‘rovini tasdiqlash yoki rad etish" })
  @ApiResponse({
    status: 200,
    description:
      "Trade-in so‘rovi holati yangilandi (approved yoki rad etildi).",
  })
  @ApiResponse({ status: 404, description: "Trade-in topilmadi." })
  approve(@Param("id") id: string, @Body("approved") approved: boolean) {
    return this.tradeInService.approve(+id, approved);
  }
}
