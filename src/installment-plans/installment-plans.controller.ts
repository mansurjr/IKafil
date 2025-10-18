import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { InstallmentPlansService } from "./installment-plans.service";
import { CreateInstallmentPlanDto } from "./dto/create-installment-plan.dto";
import { UpdateInstallmentPlanDto } from "./dto/update-installment-plan.dto";
import { Roles } from "../common/decorators/roles";
import { adminRoles } from "../types";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import { RolesGuard } from "../common/guards/role.guard";

@ApiTags("Installment Plans")
@ApiBearerAuth()
@Roles(...adminRoles)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("installment-plans")
export class InstallmentPlansController {
  constructor(
    private readonly installmentPlansService: InstallmentPlansService
  ) {}

  @Post()
  @ApiOperation({ summary: "Create new installment plan" })
  @ApiResponse({ status: 201, description: "Created successfully" })
  create(@Body() dto: CreateInstallmentPlanDto) {
    return this.installmentPlansService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all installment plans" })
  @ApiResponse({ status: 200, description: "List of plans" })
  findAll() {
    return this.installmentPlansService.findAll();
  }

  @Get("top")
  @ApiOperation({ summary: "Get top installment plans" })
  @ApiQuery({ name: "limit", required: false, example: 5 })
  getTopPlans(@Query("limit") limit?: number) {
    return this.installmentPlansService.getTopPlans(limit);
  }

  @Get("date-range")
  @ApiOperation({ summary: "Get plans by date range" })
  @ApiQuery({ name: "startDate", example: "2025-10-01T00:00:00Z" })
  @ApiQuery({ name: "endDate", example: "2025-10-14T23:59:59Z" })
  findByDateRange(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ) {
    return this.installmentPlansService.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get("percent-range")
  @ApiOperation({ summary: "Get plans by percent range" })
  @ApiQuery({ name: "min", example: 5 })
  @ApiQuery({ name: "max", example: 20 })
  findByPercentRange(@Query("min") min: number, @Query("max") max: number) {
    return this.installmentPlansService.findByPercentRange(
      Number(min),
      Number(max)
    );
  }

  @Get("first-payment-range")
  @ApiOperation({ summary: "Get plans by first payment percent range" })
  @ApiQuery({ name: "min", example: 10 })
  @ApiQuery({ name: "max", example: 30 })
  findByFirstPaymentPercentRange(
    @Query("min") min: number,
    @Query("max") max: number
  ) {
    return this.installmentPlansService.findByFirstPaymentPercentRange(
      Number(min),
      Number(max)
    );
  }

  @Get("with-contracts-count")
  @ApiOperation({ summary: "Get plans with contracts count" })
  findWithContractsCount() {
    return this.installmentPlansService.findWithContractsCount();
  }

  @Get("active")
  @ApiOperation({ summary: "Get only active installment plans" })
  findActivePlans() {
    return this.installmentPlansService.findActivePlans();
  }

  @Get("search")
  @ApiOperation({ summary: "Search plans by months or percent" })
  @ApiQuery({ name: "q", example: "10" })
  search(@Query("q") q: string) {
    return this.installmentPlansService.search(q);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update plan by ID" })
  @ApiParam({ name: "id", example: 1 })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateInstallmentPlanDto
  ) {
    return this.installmentPlansService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete plan by ID" })
  @ApiParam({ name: "id", example: 1 })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.installmentPlansService.remove(id);
  }
}
