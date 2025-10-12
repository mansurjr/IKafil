import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: number, dto: CreateCartDto) {
    try {
      const { device_id, added_at } = dto;

      const device = await this.prisma.devices.findUnique({
        where: { id: device_id },
      });
      if (!device) throw new NotFoundException('Qurilma topilmadi');

      const existing = await this.prisma.carts.findUnique({
        where: {
          user_id_device_id: {
            user_id: userId,
            device_id,
          },
        },
      });

      if (existing) {
        return { message: 'Bu qurilma allaqachon savatda mavjud', data: existing };
      }

      const created = await this.prisma.carts.create({
        data: {
          user_id: userId,
          device_id,
          added_at: added_at ?? new Date(),
        },
        include: { device: true },
      });

      return { message: 'Qurilma savatga qo‘shildi', data: created };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message || 'Savatga qo‘shishda xatolik yuz berdi');
    }
  }
  

  async findAll(userId: number) {
    try {
      const carts = await this.prisma.carts.findMany({
        where: { user_id: userId },
        include: { device: true },
        orderBy: { added_at: 'desc' },
      });
      return carts;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException('Cartlarni olishda xatolik yuz berdi');
    }
  }
  // 2423342

  async remove(id: number, userId: number) {
    try {
      const existing = await this.prisma.carts.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Cart topilmadi');

      if (existing.user_id !== userId) {
        throw new ForbiddenException('Siz faqat o‘z savat yozuvingizni o‘chirishingiz mumkin');
      }

      await this.prisma.carts.delete({ where: { id } });
      return { message: 'Cart muvaffaqiyatli o‘chirildi' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException('Cartni o‘chirishda xatolik yuz berdi');
    }
  }

  async removeAllForUser(userId: number) {
    try {
      const deleted = await this.prisma.carts.deleteMany({ where: { user_id: userId } });
      return { message: `Sizning ${deleted.count} ta savat yozuvingiz o‘chirildi` };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException('Cartlarni o‘chirishda xatolik yuz berdi');
    }
  }
}
