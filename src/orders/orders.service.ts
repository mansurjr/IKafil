import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // 🛒 Foydalanuvchi uchun order yaratish (faqat cartsdagi mahsulotlardan)
  async createOrderForDevice(userId: number, dto: CreateOrderDto) {
    const { device_ids } = dto;
    console.log('➡️ userId:', userId);
    console.log('➡️ device_ids (cart IDs):', device_ids);
  
    const allUserCarts = await this.prisma.carts.findMany({
      where: { user_id: userId },
      select: { id: true, device_id: true },
    });
    console.log('📦 Barcha savatchadagi mahsulotlar:', allUserCarts);
  
    const cartItems = await this.prisma.carts.findMany({
      where: {
        user_id: userId,
        id: { in: device_ids },
      },
      include: { device: true },
    });
  
    console.log('✅ Tanlangan cartItems:', cartItems);
  
    if (!cartItems.length) {
      throw new BadRequestException(
        'Savatchada tanlangan mahsulotlar topilmadi. Iltimos, avval savatchaga qo‘shing.',
      );
    }
  
    // 🔹 2️⃣ Allaqachon sotilgan device larni tekshiramiz
    const soldDevices = await this.prisma.orders.findMany({
      where: { device_id: { in: cartItems.map((c) => c.device_id) } },
    });
  
    if (soldDevices.length > 0) {
      throw new BadRequestException('Ba’zi mahsulotlar allaqachon sotib olingan.');
    }
  
    // 🔹 3️⃣ Har bir mahsulot uchun order yaratamiz
    const createdOrders = await Promise.all(
      cartItems.map((item) =>
        this.prisma.orders.create({
          data: {
            user_id: userId,
            device_id: item.device_id,
            total_price: item.device?.base_price ?? 0,
            payment_status: PaymentStatus.pending,
            payment_method: PaymentMethod.cash,
          },
        }),
      ),
    );
  
    // 🔹 4️⃣ Savatchadan shu mahsulotlarni o‘chiramiz
    await this.prisma.carts.deleteMany({
      where: { id: { in: cartItems.map((item) => item.id) } },
    });
  
    return {
      success: true,
      message: `${createdOrders.length} ta buyurtma muvaffaqiyatli yaratildi va savatchadan olib tashlandi.`,
      orders: createdOrders,
    };
  }
  

  // 👤 Foydalanuvchining barcha buyurtmalari
  async getUserOrders(userId: number) {
    const orders = await this.prisma.orders.findMany({
      where: { user_id: userId },
      include: {
        device: { include: { device_images: true, details: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!orders.length) {
      throw new BadRequestException('Sizda hali buyurtmalar mavjud emas.');
    }

    return {
      success: true,
      message: 'Buyurtmalar muvaffaqiyatli olindi.',
      orders,
    };
  }

  // 🧾 Admin yoki SuperAdmin tomonidan buyurtmani tasdiqlash
  async confirmOrder(orderId: number, adminId: number) {
    const admin = await this.prisma.users.findUnique({
      where: { id: adminId },
    });

    if (!admin || (admin.role !== 'admin' && admin.role !== 'superadmin')) {
      throw new ForbiddenException(
        'Faqat admin yoki superAdmin tasdiqlay oladi.'
      );
    }

    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
    });
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
  }

  // ❌ Admin yoki SuperAdmin tomonidan buyurtmani o‘chirish
  async deleteOrder(orderId: number, adminId: number) {
    const admin = await this.prisma.users.findUnique({
      where: { id: adminId },
    });

    if (!admin || (admin.role !== 'admin' && admin.role !== 'superadmin')) {
      throw new ForbiddenException(
        'Faqat admin yoki superAdmin o‘chira oladi.'
      );
    }

    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new BadRequestException('Buyurtma topilmadi.');

    await this.prisma.orders.delete({ where: { id: orderId } });

    return {
      success: true,
      message: 'Buyurtma muvaffaqiyatli o‘chirildi.',
    };
  }
}
