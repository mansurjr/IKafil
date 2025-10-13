import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { PaymentScheduleService } from "./payment-schedule.service";
import { CreatePaymentScheduleDto } from "./dto/create-payment-schedule.dto";
import { UpdatePaymentScheduleDto } from "./dto/update-payment-schedule.dto";
import { PaymentStatus } from "@prisma/client";

@ApiTags("Payment Schedule")
@Controller("payment-schedule")
export class PaymentScheduleController {
  constructor(
    private readonly paymentScheduleService: PaymentScheduleService
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new payment schedule" })
  @ApiBody({ type: CreatePaymentScheduleDto })
  @ApiResponse({
    status: 201,
    description: "Payment schedule created successfully",
  })
  create(@Body() createPaymentScheduleDto: CreatePaymentScheduleDto) {
    return this.paymentScheduleService.create(createPaymentScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all payment schedules" })
  @ApiResponse({ status: 200, description: "List of all payment schedules" })
  findAll() {
    return this.paymentScheduleService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get payment schedule by ID" })
  @ApiParam({ name: "id", type: Number })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.paymentScheduleService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a payment schedule" })
  @ApiParam({ name: "id", type: Number })
  @ApiBody({ type: UpdatePaymentScheduleDto })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePaymentScheduleDto: UpdatePaymentScheduleDto
  ) {
    return this.paymentScheduleService.update(id, updatePaymentScheduleDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a payment schedule" })
  @ApiParam({ name: "id", type: Number })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.paymentScheduleService.remove(id);
  }

  @Get("contract/:contractId")
  @ApiOperation({
    summary: "Get all payment schedules for a specific contract",
  })
  @ApiParam({ name: "contractId", type: Number })
  getByContractId(@Param("contractId", ParseIntPipe) contractId: number) {
    return this.paymentScheduleService.getByContractId(contractId);
  }

  @Get("contract/:contractId/status")
  @ApiOperation({
    summary: "Get payment schedules for a contract filtered by status",
  })
  @ApiParam({ name: "contractId", type: Number })
  @ApiQuery({ name: "status", enum: PaymentStatus })
  getByContractIdAndStatus(
    @Param("contractId", ParseIntPipe) contractId: number,
    @Query("status") status: PaymentStatus
  ) {
    return this.paymentScheduleService.getByContractIdAndStatus(
      contractId,
      status
    );
  }

  @Get("buyer/:buyerId")
  @ApiOperation({
    summary: "Get all payment schedules for a buyer (optional status)",
  })
  @ApiParam({ name: "buyerId", type: Number })
  @ApiQuery({ name: "status", enum: PaymentStatus, required: false })
  getByBuyerIdAndStatus(
    @Param("buyerId", ParseIntPipe) buyerId: number,
    @Query("status") status?: PaymentStatus
  ) {
    return this.paymentScheduleService.getByBuyerIdAndStatus(buyerId, status);
  }
}
