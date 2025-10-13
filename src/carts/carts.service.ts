import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCartDto } from "./dto/create-cart.dto";

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: number, dto: CreateCartDto) {
    try {
      const { device_id } = dto;

      const device = await this.prisma.devices.findUnique({
        where: { id: device_id },
      });
      if (!device) throw new NotFoundException("Device not found");

      const existing = await this.prisma.carts.findUnique({
        where: {
          user_id_device_id: {
            user_id: userId,
            device_id,
          },
        },
      });

      if (existing) {
        throw new ConflictException("This device is already in the cart");
      }

      const created = await this.prisma.carts.create({
        data: {
          user_id: userId,
          device_id,
        },
      });

      return { message: "Device added to cart", data: created };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(
        error.message || "An error occurred while adding to cart"
      );
    }
  }

  async getCardByUserId(userId: number) {
    try {
      const carts = await this.prisma.carts.findMany({
        where: { user_id: userId },
        orderBy: { added_at: "desc" },
      });
      return carts;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException("Error occurred while fetching carts");
    }
  }

  async remove(id: number, userId: number) {
    const existing = await this.prisma.carts.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Cart not found");

    if (existing.user_id !== userId) {
      throw new ForbiddenException("You can only delete your own cart items");
    }

    await this.prisma.carts.delete({ where: { id } });
    return { status: "ok" };
  }

  async removeAllForUser(userId: number) {
    try {
      const deleted = await this.prisma.carts.deleteMany({
        where: { user_id: userId },
      });
      return {
        message: `Your ${deleted.count} cart item(s) have been deleted`,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException("Error occurred while deleting carts");
    }
  }
}
