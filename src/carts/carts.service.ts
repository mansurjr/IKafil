import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartsService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: number, deviceId: number) {
    try {
      const device = await this.prisma.devices.findUnique({ where: { id: deviceId } });
      if (!device) {
        throw new HttpException('Qurilma topilmadi', HttpStatus.NOT_FOUND);
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
      });
  
      return { message: 'Qurilma savatga qo‘shildi', data: created };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Savatga qo‘shishda xatolik',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  

  async findAll() {
    try {
      return await this.prisma.carts.findMany({
        include: { user: true, device: true },
        orderBy: { added_at: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException('Cartlarni olishda xatolik yuz berdi');
    }
  }

  async findOne(id: number) {
    try {
      const cart = await this.prisma.carts.findUnique({
        where: { id },
        include: { user: true, device: true },
      });

      if (!cart) throw new NotFoundException('Cart topilmadi');
      return cart;
    } catch (error) {
      throw new BadRequestException(error.message || 'Cartni olishda xatolik yuz berdi');
    }
  }



  async remove(id: number) {
    try {
      const existing = await this.prisma.carts.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Cart topilmadi');

      await this.prisma.carts.delete({ where: { id } });
      return { message: 'Cart muvaffaqiyatli o‘chirildi' };
    } catch (error) {
      throw new BadRequestException(error.message || 'Cartni o‘chirishda xatolik yuz berdi');
    }
  }
}
