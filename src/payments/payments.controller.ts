import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
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
    description: "Payment successfully created",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data or duplicate payment",
  })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all payments" })
  @ApiResponse({
    status: 200,
    description: "List of all payments returned successfully",
  })
  findAll() {
    return this.paymentsService.findAll();
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

  @Get(":id")
  @ApiOperation({ summary: "Get payment by ID" })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Payment ID",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Payment found and returned successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Payment not found",
  })
  findOne(@Param("id") id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a payment by ID" })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Payment ID",
    example: 1,
  })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({
    status: 200,
    description: "Payment updated successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Payment not found",
  })
  update(@Param("id") id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a payment by ID" })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Payment ID",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Payment deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Payment not found",
  })
  remove(@Param("id") id: string) {
    return this.paymentsService.remove(+id);
  }
}
