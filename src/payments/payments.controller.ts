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
import { PaymentStatus } from "@prisma/client";
import { GetCurrentUser } from "../common/decorators/getCurrentUser";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";

@ApiTags("Payments")
@ApiBearerAuth()
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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

  @Get("buyer/:buyerId")
  @UseGuards(JwtAuthGuard)
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

  @Get()
  @ApiOperation({ summary: "Admin: get all payments" })
  async findAll() {
    return this.paymentsService.findAll();
  }
}
