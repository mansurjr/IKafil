import { Controller, Post, Get, Delete, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import type { Request } from 'express';
import { CartService } from './carts.service';
import { JwtAuthGuard } from '../common/guards/accessToken.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // POST /cart/:deviceId  -> addToCart (userId from req.user)
  @Post(':deviceId')
  async addToCart(@Req() req: Request, @Param('deviceId', ParseIntPipe) deviceId: number) {
    // req.user ni sizning auth stratangiz qanday joylashtirsa shunday olasiz.
    // ko'pincha `req.user` ichida `id` bo'ladi: req.user.id
    const user = req.user as any;
    const userId = user?.id;
    if (!userId) {
      // this normally won't happen b/c JwtAuthGuard tekshiradi, lekin xavfsizlik uchun:
      throw new Error('Avtorizatsiya topilmadi');
    }
    return this.cartService.addToCart(userId, deviceId);
  }

  // GET /cart -> hozirgi foydalanuvchining savati
  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    const userId = user?.id;
    return this.cartService.findAll(userId);
  }

  // DELETE /cart/:id -> faqat o'z cartini o'chiradi
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = req.user as any;
    const userId = user?.id;
    return this.cartService.remove(id, userId);
  }

  // DELETE /cart -> hozirgi foydalanuvchining barcha cart yozuvlarini o'chiradi
  @Delete()
  async removeAll(@Req() req: Request) {
    const user = req.user as any;
    const userId = user?.id;
    return this.cartService.removeAllForUser(userId);
  }

}
