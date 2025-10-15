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
  UseGuards,
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
import { PaymentScheduleService } from "./payment-schedule.service";
import { CreatePaymentScheduleDto } from "./dto/create-payment-schedule.dto";
import { UpdatePaymentScheduleDto } from "./dto/update-payment-schedule.dto";
import { PaymentStatus, UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import { RolesGuard } from "../common/guards/role.guard";
import { Roles } from "../common/decorators/roles";

@ApiTags("Payment Schedule")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payment-schedule")
export class PaymentScheduleController {
  constructor(
    private readonly paymentScheduleService: PaymentScheduleService
  ) {}

  @Roles(UserRole.admin, UserRole.superadmin, UserRole.seller)
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

  @Roles(UserRole.admin, UserRole.superadmin, UserRole.support)
  @Get()
  @ApiOperation({ summary: "Get all payment schedules" })
  @ApiResponse({ status: 200, description: "List of all payment schedules" })
  findAll() {
    return this.paymentScheduleService.findAll();
  }

  @Roles(
    UserRole.admin,
    UserRole.superadmin,
    UserRole.support,
    UserRole.seller,
    UserRole.buyer
  )
  @Get(":id")
  @ApiOperation({ summary: "Get payment schedule by ID" })
  @ApiParam({ name: "id", type: Number })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.paymentScheduleService.findOne(id);
  }

  @Roles(UserRole.admin, UserRole.superadmin, UserRole.seller)
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

  @Roles(UserRole.admin, UserRole.superadmin)
  @Delete(":id")
  @ApiOperation({ summary: "Delete a payment schedule" })
  @ApiParam({ name: "id", type: Number })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.paymentScheduleService.remove(id);
  }

  @Roles(
    UserRole.admin,
    UserRole.superadmin,
    UserRole.support,
    UserRole.seller,
    UserRole.buyer
  )
  @Get("contract/:contractId")
  @ApiOperation({
    summary: "Get all payment schedules for a specific contract",
  })
  @ApiParam({ name: "contractId", type: Number })
  getByContractId(@Param("contractId", ParseIntPipe) contractId: number) {
    return this.paymentScheduleService.getByContractId(contractId);
  }

  @Roles(UserRole.admin, UserRole.superadmin, UserRole.support)
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

  @Roles(
    UserRole.admin,
    UserRole.superadmin,
    UserRole.support,
    UserRole.seller,
    UserRole.buyer
  )
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
