import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CartService } from "./carts.service";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import { CreateCartDto } from "./dto/create-cart.dto";
import { GetCurrentUser } from "../common/decorators/getCurrentUser";

@ApiBearerAuth()
@ApiTags("Cart")
@UseGuards(JwtAuthGuard)
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: "Foydalanuvchining savatiga qurilma qoshish" })
  @ApiResponse({
    status: 201,
    description: "Qurilma savatga muvaffaqiyatli qoshildi",
  })
  async addToCart(
    @GetCurrentUser("id", ParseIntPipe) userId: number,
    @Body() dto: CreateCartDto
  ) {
    return await this.cartService.addToCart(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Foydalanuvchining savatini olish" })
  @ApiResponse({ status: 200, description: "Savatdagi barcha mahsulotlar" })
  async findAll(@GetCurrentUser("id", ParseIntPipe) userId: number) {
    return await this.cartService.getCardByUserId(userId);
  }

  @Delete()
  @ApiOperation({
    summary: "Foydalanuvchining barcha savat elementlarini ochirish",
  })
  @ApiResponse({ status: 200, description: "Barcha elementlar ochirildi" })
  async bulkRemove(@GetCurrentUser("id", ParseIntPipe) userId: number) {
    return await this.cartService.removeAllForUser(userId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Savatdan bitta elementni ochirish" })
  @ApiResponse({
    status: 200,
    description: "Element muvaffaqiyatli ochirildi",
  })
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @GetCurrentUser("id", ParseIntPipe) userId: number
  ) {
    return await this.cartService.remove(id, userId);
  }
}
