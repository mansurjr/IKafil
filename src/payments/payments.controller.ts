import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentStatus } from "@prisma/client";
import { GetCurrentUser } from "../common/decorators/getCurrentUserid";

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new payment" })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: "Payment created successfully",
  })
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Patch(":id/confirm")
  @ApiOperation({ summary: "Confirm a payment by ID" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: "Payment confirmed successfully",
  })
  async confirmPayment(@Param("id", ParseIntPipe) id: number) {
    return this.paymentsService.confirmPayment(id);
  }

  @Patch(":id/reject")
  @ApiOperation({ summary: "Reject a payment by ID" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        reason: { type: "string", example: "Invalid transaction" },
      },
    },
  })
  async rejectPayment(
    @Param("id", ParseIntPipe) id: number,
    @Body("reason") reason?: string
  ) {
    return this.paymentsService.rejectPayment(id, reason);
  }

  @Get("contract/:contract_id")
  @ApiOperation({ summary: "Get all payments for a specific contract" })
  @ApiParam({ name: "contract_id", type: Number, example: 1 })
  async getPaymentsByContract(
    @Param("contract_id", ParseIntPipe) contract_id: number
  ) {
    return this.paymentsService.getPaymentsByContract(contract_id);
  }

  @Get("own")
  @ApiOperation({ summary: "Get user payments by status" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: PaymentStatus,
    description: "Filter payments by status (e.g. PENDING, COMPLETED, FAILED)",
  })
  @ApiResponse({
    status: 200,
    description: "List of user payments returned successfully",
  })
  getByBuyerIdAndStatus(
    @Query("status") status: PaymentStatus,
    @GetCurrentUser() id: number
  ) {
    return this.paymentsService.getByBuyerIdAndStatus(id, status);
  }

  @Get()
  @ApiOperation({ summary: "Get all payments" })
  async findAll() {
    return this.paymentsService.findAll();
  }
}
