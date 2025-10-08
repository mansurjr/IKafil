import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new payment" })
  @ApiResponse({ status: 201, description: "Payment successfully created" })
  @ApiResponse({
    status: 400,
    description: "Invalid input data or duplicate payment",
  })
  @ApiBody({ type: CreatePaymentDto })
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

  @Get(":id")
  @ApiOperation({ summary: "Get payment by ID" })
  @ApiParam({ name: "id", type: Number, description: "Payment ID" })
  @ApiResponse({
    status: 200,
    description: "Payment found and returned successfully",
  })
  @ApiResponse({ status: 404, description: "Payment not found" })
  findOne(@Param("id") id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a payment by ID" })
  @ApiParam({ name: "id", type: Number, description: "Payment ID" })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, description: "Payment updated successfully" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  update(@Param("id") id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a payment by ID" })
  @ApiParam({ name: "id", type: Number, description: "Payment ID" })
  @ApiResponse({ status: 200, description: "Payment deleted successfully" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  remove(@Param("id") id: string) {
    return this.paymentsService.remove(+id);
  }
}
