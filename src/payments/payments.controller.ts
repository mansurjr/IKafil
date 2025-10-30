import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentStatus, UserRole } from "@prisma/client";
import { GetCurrentUser } from "../common/decorators/getCurrentUserid";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import { RolesGuard } from "../common/guards/role.guard";
import { Roles } from "../common/decorators/roles";

@ApiTags("Payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 🟢 CREATE PAYMENT — faqat buyer tolov yaratadi
  @Roles(UserRole.buyer)
  @Post()
  @ApiOperation({ summary: "Create a new payment (status will be pending)" })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: "Payment created and pending confirmation",
  })
  @ApiResponse({ status: 400, description: "Invalid amount or request" })
  async create(
    @Body() dto: CreatePaymentDto,
    @GetCurrentUser("id") buyerId: number
  ) {
    return this.paymentsService.create(dto, buyerId);
  }

  // 🟡 UPDATE PAYMENT STATUS — faqat admin, superadmin yoki seller tasdiqlaydi
  @Roles(UserRole.admin, UserRole.superadmin, UserRole.seller)
  @Patch(":id/status")
  @ApiOperation({ summary: "Confirm or reject a payment" })
  @ApiParam({ name: "id", type: Number, description: "Payment ID" })
  @ApiQuery({ name: "status", enum: PaymentStatus })
  @ApiResponse({ status: 200, description: "Payment status updated" })
  @ApiResponse({ status: 400, description: "Invalid status update" })
  async updateStatus(
    @Param("id", ParseIntPipe) paymentId: number,
    @Query("status") status: PaymentStatus
  ) {
    return this.paymentsService.updateStatus(paymentId, status);
  }

  // 🟢 GET PAYMENTS BY CONTRACT — buyer, seller, admin, support korishi mumkin
  @Roles(
    UserRole.admin,
    UserRole.superadmin,
    UserRole.support,
    UserRole.buyer,
    UserRole.seller
  )
  @Get("contract/:contractId")
  @ApiOperation({ summary: "Get all payments and schedule for a contract" })
  @ApiParam({ name: "contractId", type: Number })
  @ApiQuery({ name: "buyerId", type: Number, description: "ID of the buyer" })
  async getContractPayments(
    @Param("contractId", ParseIntPipe) contractId: number,
    @Query("buyerId", ParseIntPipe) buyerId: number
  ) {
    return this.paymentsService.getContractPayments(contractId, buyerId);
  }

  // 🟢 GET BUYER PAYMENTS — faqat osha buyer yoki admin/superadmin/support
  @Roles(
    UserRole.admin,
    UserRole.superadmin,
    UserRole.support,
    UserRole.buyer
  )
  @Get("buyer/:buyerId")
  @ApiOperation({
    summary: "Get all payments for a buyer, optionally by status",
  })
  @ApiParam({ name: "buyerId", type: Number })
  @ApiQuery({ name: "status", enum: PaymentStatus, required: false })
  async getByBuyer(
    @GetCurrentUser("id") buyerId: number,
    @Query("status") status?: PaymentStatus
  ) {
    return this.paymentsService.getByBuyerIdAndStatus(buyerId, status);
  }

  // 🔴 GET ALL PAYMENTS — faqat admin va superadmin
  @Roles(UserRole.admin, UserRole.superadmin)
  @Get()
  @ApiOperation({ summary: "Admin: get all payments" })
  async findAll() {
    return this.paymentsService.findAll();
  }
}
