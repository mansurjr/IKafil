import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/accessToken.guard';
import { GetCurrentUser } from '../common/decorators/getCurrentUser';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiBearerAuth()
@ApiTags('Orders')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Savatchadagi bir nechta mahsulotlardan buyurtma yaratish' })
  @ApiResponse({ status: 201, description: 'Buyurtmalar muvaffaqiyatli yaratildi' })
  async createOrder(
    @GetCurrentUser('id') userId: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrderForDevice(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Foydalanuvchining barcha buyurtmalarini olish' })
  async getUserOrders(@GetCurrentUser('id') userId: number) {
    return this.ordersService.getUserOrders(userId);
  }

  @Patch(':orderId/confirm')
  @ApiOperation({ summary: 'Admin yoki SuperAdmin buyurtmani to‘langan deb belgilaydi' })
  @ApiParam({ name: 'orderId', type: Number })
  async confirmOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @GetCurrentUser('id') adminId: number,
  ) {
    return this.ordersService.confirmOrder(orderId, adminId);
  }

  @Delete(':orderId')
  @ApiOperation({ summary: 'Admin yoki SuperAdmin buyurtmani o‘chirish' })
  @ApiParam({ name: 'orderId', type: Number })
  async deleteOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @GetCurrentUser('id') adminId: number,
  ) {
    return this.ordersService.deleteOrder(orderId, adminId);
  }
}
