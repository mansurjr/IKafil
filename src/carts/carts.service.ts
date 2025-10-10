import { Injectable, NotFoundException, BadRequestException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // sizning Prisma service yo'lingiz
import { Prisma } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // addToCart: hozirgi userni req.user dan oladi (controller orqali uzatiladi)
  async addToCart(userId: number, deviceId: number) {
    try {
      const device = await this.prisma.devices.findUnique({ where: { id: deviceId } });
      if (!device) {
        throw new NotFoundException('Qurilma topilmadi');
      }

      const existing = await this.prisma.carts.findUnique({
        where: {
          user_id_device_id: {
            user_id: userId,
            device_id: deviceId,
          },
        },
      });

      if (existing) {
        return { message: 'Bu qurilma allaqachon savatda mavjud', data: existing };
      }

      const created = await this.prisma.carts.create({
        data: { user_id: userId, device_id: deviceId },
        include: { device: true, user: true },
      });

      return { message: 'Qurilma savatga qo‘shildi', data: created };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Savatga qo‘shishda xatolik',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // findAll: faqat hozirgi userning savat yozuvlarini qaytaradi
  async findAll(userId: number) {
    try {
      return await this.prisma.carts.findMany({
        where: { user_id: userId },
        include: { user: true, device: true },
        orderBy: { added_at: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException('Cartlarni olishda xatolik yuz berdi');
    }
  }

  // remove: faqat egasi o'chira oladi
  async remove(id: number, userId: number) {
    try {
      const existing = await this.prisma.carts.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Cart topilmadi');

      if (existing.user_id !== userId) {
        // foydalanuvchi o'zining emasligini ko'rsatsa ruxsat yo'q
        throw new ForbiddenException('Siz faqat o‘z savat yozuvingizni o‘chirishingiz mumkin');
      }

      await this.prisma.carts.delete({ where: { id } });
      return { message: 'Cart muvaffaqiyatli o‘chirildi' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      throw new BadRequestException(error.message || 'Cartni o‘chirishda xatolik yuz berdi');
    }
  }

  // removeAll: hozirgi foydalanuvchining barcha cart yozuvlarini o'chiradi
  async removeAllForUser(userId: number) {
    try {
      const deleted = await this.prisma.carts.deleteMany({ where: { user_id: userId } });
      return { message: `Foydalanuvchi uchun ${deleted.count} ta cart yozuv o‘chirildi` };
    } catch (error) {
      throw new BadRequestException(error.message || 'Cartlarni o‘chirishda xatolik yuz berdi');
    }
  }

}
