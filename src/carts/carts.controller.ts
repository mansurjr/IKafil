import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  UnauthorizedException,
  Body,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { Request } from "express";
import { CartService } from "./carts.service";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import { CreateCartDto } from "./dto/create-cart.dto";
import { GetCurrentUser } from "../common/decorators/getCurrentUser";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: "Foydalanuvchining savatiga qurilma qo‘shish" })
  @ApiResponse({
    status: 201,
    description: "Qurilma savatga muvaffaqiyatli qo‘shildi",
  })
  async addToCart(@Req() req: Request, @Body() dto: CreateCartDto) {
    const user = req.user as { id: number };
    if (!user?.id) throw new UnauthorizedException("Avtorizatsiya topilmadi");
    return this.cartService.addToCart(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@GetCurrentUser("id", ParseIntPipe) id: number) {
    return this.cartService.getCardByUserId(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async BulkREmove(@GetCurrentUser("id", ParseIntPipe) id: number) {
    return this.cartService.removeAllForUser(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async remove(
    @Req() req: Request,
    @Param("id", ParseIntPipe) id: number,
    @GetCurrentUser("id", ParseIntPipe) userId: number
  ) {
    return this.cartService.remove(id, userId);
  }
}
