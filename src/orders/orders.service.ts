import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { orders, PaymentMethod, PaymentStatus, UserRole } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // 🛒 Foydalanuvchi uchun order yaratish (faqat cartsdagi mahsulotlardan)
  async createOrderForDevice(userId: number, dto: CreateOrderDto) {
    try {
      const { device_ids } = dto;
  
      if (!device_ids?.length) {
        throw new BadRequestException('device_ids bo‘sh bo‘lishi mumkin emas.');
      }
  
      // 1️⃣ Savatchadan tanlangan cartItemsni olish
      const cartItems = await this.prisma.carts.findMany({
        where: { user_id: userId, id: { in: device_ids } },
        include: { device: true },
      });
  
      if (!cartItems.length) {
        throw new BadRequestException('Savatchada tanlangan mahsulotlar topilmadi.');
      }
  
      // 2️⃣ Allaqachon sotilgan device larni olish
      const soldDeviceIds = (
        await this.prisma.orders.findMany({
          where: { device_id: { in: cartItems.map(c => c.device_id) } },
          select: { device_id: true },
        })
      ).map(o => o.device_id);
  
      const createdOrders: typeof cartItems = [];
      const skipped: { device_id: number; reason: string }[] = [];
  
      // 3️⃣ Har bir cartItemni tekshirish va order yaratish
      for (const item of cartItems) {
        if (!item.device?.is_active) {
          skipped.push({ device_id: item.device_id, reason: 'Device not active' });
          continue;
        }
  
        if (soldDeviceIds.includes(item.device_id)) {
          skipped.push({ device_id: item.device_id, reason: 'Already sold' });
          continue;
        }
  
        const order = await this.prisma.orders.create({
          data: {
            user_id: userId,
            device_id: item.device_id,
            total_price: item.device?.base_price ?? 0,
            payment_status: PaymentStatus.pending,
            payment_method: PaymentMethod.cash,
          },
        });
  
        createdOrders.push({
          ...order,
          device: item.device,
          added_at: null,
        });
      }
  
      // 4️⃣ Savatchadan barcha tanlangan device_ids ni o‘chirish
      await this.prisma.carts.deleteMany({
        where: { id: { in: device_ids } },
      });
  
      // 5️⃣ Userga email yuborish
      if (createdOrders.length > 0) {
        const user = await this.prisma.users.findUnique({ where: { id: userId } });
        if (user?.email) {
          const mailText = `
            Salom ${user.full_name},
      
            Sizning buyurtmangiz qabul qilindi ✅.
      
            Tasdiqlash uchun iltimos admin bilan bog‘laning: ${user.phone || 'telefon raqami mavjud emas'}.
      
            Rahmat, IKafil jamoasi.
          `;
          await this.mailService.sendOtpMail(user.email, mailText); // yoki sendMail/sendNewCredentialsMail usuliga moslashtiring
        }
      }
      
      
  
      // 6️⃣ Javob qaytarish
      if (createdOrders.length === 0) {
        return {
          success: false,
          message: 'Faol va hali sotilmagan mahsulot topilmadi.',
          orders: createdOrders,
          skipped,
        };
      }
  
      return {
        success: true,
        message: `${createdOrders.length} ta buyurtma muvaffaqiyatli yaratildi.`,
        orders: createdOrders,
        skipped,
      };
    } catch (error) {
      console.error('❌ createOrderForDevice error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Buyurtma yaratishda xatolik yuz berdi.');
    }
  }
  
  
  
  
  
  
  

  // 👤 Buyurtmalarni olish (rolega qarab)
  async getUserOrders(userId: number) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) throw new BadRequestException('Foydalanuvchi topilmadi.');

      let orders;
      if (user.role === UserRole.admin || user.role === UserRole.superadmin) {
        // Admin va SuperAdmin barcha buyurtmalarni ko‘radi
        orders = await this.prisma.orders.findMany({
          include: { device: { include: { device_images: true, details: true } }, user: true },
          orderBy: { created_at: 'desc' },
        });
      } else {
        // Oddiy foydalanuvchi faqat o‘z buyurtmalarini ko‘radi
        orders = await this.prisma.orders.findMany({
          where: { user_id: userId },
          include: { device: { include: { device_images: true, details: true } } },
          orderBy: { created_at: 'desc' },
        });
      }

      if (!orders.length) throw new BadRequestException('Buyurtmalar topilmadi.');

      return {
        success: true,
        message: 'Buyurtmalar muvaffaqiyatli olindi.',
        orders,
      };
    } catch (error) {
      console.error('❌ getUserOrders error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Buyurtmalarni olishda xatolik yuz berdi.');
    }
  }

  // 🧾 Admin yoki SuperAdmin tomonidan buyurtmani tasdiqlash
  async confirmOrder(orderId: number, adminId: number) {
    try {
      const admin = await this.prisma.users.findUnique({ where: { id: adminId } });
      if (!admin || (admin.role !== UserRole.admin && admin.role !== UserRole.superadmin)) {
        throw new ForbiddenException('Faqat admin yoki superAdmin tasdiqlay oladi.');
      }

      const order = await this.prisma.orders.findUnique({ where: { id: orderId } });
      if (!order) throw new BadRequestException('Buyurtma topilmadi.');
      if (order.payment_status === PaymentStatus.paid) {
        throw new BadRequestException('Bu buyurtma allaqachon to‘langan.');
      }

      const updatedOrder = await this.prisma.orders.update({
        where: { id: orderId },
        data: {
          payment_status: PaymentStatus.paid,
          payment_method: PaymentMethod.online,
          updated_at: new Date(),
        },
      });

      return {
        success: true,
        message: 'Buyurtma to‘landi deb belgilandi.',
        order: updatedOrder,
      };
    } catch (error) {
      console.error('❌ confirmOrder error:', error);
      if (error instanceof BadRequestException || error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Buyurtmani tasdiqlashda xatolik yuz berdi.');
    }
  }

  // ❌ Admin yoki SuperAdmin tomonidan buyurtmani o‘chirish
  async deleteOrder(orderId: number, adminId: number) {
    try {
      const admin = await this.prisma.users.findUnique({ where: { id: adminId } });
      if (!admin || (admin.role !== UserRole.admin && admin.role !== UserRole.superadmin)) {
        throw new ForbiddenException('Faqat admin yoki superAdmin o‘chira oladi.');
      }

      const order = await this.prisma.orders.findUnique({ where: { id: orderId } });
      if (!order) throw new BadRequestException('Buyurtma topilmadi.');

      await this.prisma.orders.delete({ where: { id: orderId } });

      // 🔹 O‘chirilgan orderga tegishli device ni qayta aktivlashtirish
      await this.prisma.devices.update({
        where: { id: order.device_id },
        data: { is_active: true },
      });

      return {
        success: true,
        message: 'Buyurtma muvaffaqiyatli o‘chirildi va device qayta aktivlashtirildi.',
      };
    } catch (error) {
      console.error('❌ deleteOrder error:', error);
      if (error instanceof BadRequestException || error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException('Buyurtmani o‘chirishda xatolik yuz berdi.');
    }
  }
}
