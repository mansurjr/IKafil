import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags('Carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yangi cart (savatga qurilma) yaratish' })
  @ApiResponse({ status: 201, description: 'Cart muvaffaqiyatli yaratildi' })
  @ApiResponse({ status: 400, description: 'Xatolik yoki noto‘g‘ri ma’lumot' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'integer', example: 1 },
        device_id: { type: 'integer', example: 5 },
      },
      required: ['user_id', 'device_id'],
    },
  })
  async create(@Body() dto: CreateCartDto) {
    return this.cartsService.addToCart(dto.user_id, dto.device_id);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha cartlarni olish' })
  @ApiResponse({ status: 200, description: 'Cartlar ro‘yxati' })
  findAll() {
    return this.cartsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID bo‘yicha bitta cartni olish' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Cart topildi' })
  @ApiResponse({ status: 404, description: 'Cart topilmadi' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cartsService.findOne(id);
  }


  @Delete(':id')
  @ApiOperation({ summary: 'Cartni o‘chirish' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Cart muvaffaqiyatli o‘chirildi' })
  @ApiResponse({ status: 404, description: 'Cart topilmadi' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cartsService.remove(id);
  }
}
