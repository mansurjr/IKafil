import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentStatus } from "@prisma/client";
import { GetCurrentUser } from "../common/decorators/getCurrentUserid";
import { Roles } from "../common/decorators/roles";
import { RolesGuard } from "../common/guards/role.guard";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";

@ApiTags("Payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // =============================================
  // 1️⃣ Tolovni qayd etish (foydalanuvchi)
  // =============================================
  @Post()
  @ApiOperation({ summary: "Kontrakt boyicha tolovni amalga oshirish" })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: "Tolov muvaffaqiyatli amalga oshirildi",
  })
  async createPayment(
    @Body() dto: CreatePaymentDto,
    @GetCurrentUser() buyerId: number
  ) {
    if (!buyerId) throw new ForbiddenException("Foydalanuvchi aniqlanmadi");
    return this.paymentsService.create(dto, buyerId);
  }

  // =============================================
  // 2️⃣ Foydalanuvchi tolovlarini kuzatish
  // =============================================
  @Get("contract/:contract_id")
  @ApiOperation({
    summary: "Foydalanuvchi kontrakti boyicha tolov jadvali va tarixini olish",
  })
  @ApiParam({ name: "contract_id", type: Number, example: 1 })
  async getContractPayments(
    @Param("contract_id", ParseIntPipe) contract_id: number,
    @GetCurrentUser() buyerId: number
  ) {
    return this.paymentsService.getContractPayments(contract_id, buyerId);
  }

  // =============================================
  // 3️⃣ Foydalanuvchi tolovlarini status boyicha olish
  // =============================================
  @Get("own")
  @ApiOperation({
    summary: "Foydalanuvchining tolovlarini status boyicha olish",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: PaymentStatus,
    description: "Tolov holati boyicha filtrlash (pending, paid, late...)",
  })
  @ApiResponse({
    status: 200,
    description: "Foydalanuvchi tolovlari muvaffaqiyatli qaytarildi",
  })
  async getUserPaymentsByStatus(
    @Query("status") status: PaymentStatus,
    @GetCurrentUser() buyerId: number
  ) {
    if (!buyerId) throw new ForbiddenException("Foydalanuvchi aniqlanmadi");
    return this.paymentsService.getByBuyerIdAndStatus(buyerId, status);
  }

  // =============================================
  // 4️⃣ Admin — barcha tolovlarni olish
  // =============================================
  @Get()
  @Roles("admin")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Admin — barcha tolovlarni olish" })
  async findAll() {
    return this.paymentsService.findAll();
  }

  // =============================================
  // 5️⃣ Admin — tolovni tasdiqlash
  // =============================================
  @Patch(":id/confirm")
  @Roles("admin")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Admin — tolovni tasdiqlash (status = paid)" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: "Tolov muvaffaqiyatli tasdiqlandi",
  })
  async confirmPayment(@Param("id", ParseIntPipe) id: number) {
    return this.paymentsService.confirm(id);
  }

  // =============================================
  // 6️⃣ Admin — tolovni rad etish
  // =============================================
  @Patch(":id/reject")
  @Roles("admin")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Admin — tolovni rad etish (status = rejected)" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          example: "Notogri tolov summasi yoki kontrakt raqami",
        },
      },
    },
  })
  async rejectPayment(
    @Param("id", ParseIntPipe) id: number,
    @Body("reason") reason?: string
  ) {
    return this.paymentsService.reject(id, reason);
  }
}
