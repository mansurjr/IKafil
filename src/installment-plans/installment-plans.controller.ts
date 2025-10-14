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
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
import { InstallmentPlansService } from "./installment-plans.service";
import { CreateInstallmentPlanDto } from "./dto/create-installment-plan.dto";
import { UpdateInstallmentPlanDto } from "./dto/update-installment-plan.dto";
import { QueryInstallmentPlanDto } from "./dto/query-installment-plan.dto";

@ApiTags("Installment Plans")
@Controller("installment-plans")
export class InstallmentPlansController {
  constructor(
    private readonly installmentPlansService: InstallmentPlansService
  ) {}

  @Post()
  @ApiOperation({
    summary: "Create new installment plan (Only Admin)",
    description: "Creates a new installment plan with given details.",
  })
  @ApiResponse({
    status: 201,
    description: "New installment plan created successfully!",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid data provided or creation failed.",
  })
  create(@Body() createInstallmentPlanDto: CreateInstallmentPlanDto) {
    return this.installmentPlansService.create(createInstallmentPlanDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all installment plans (Only Admin)",
    description: "Retrieves a list of all available installment plans.",
  })
  @ApiResponse({
    status: 200,
    description: "All installment plans retrieved successfully.",
  })
  @Get()
  findAll(@Query() query: QueryInstallmentPlanDto) {
    return this.installmentPlansService.findAll(query);
  }

  @Get("top")
  @ApiQuery({
    name: "limit",
    required: false,
    example: 5,
    description: "Qancha top plan olish kerak",
  })
  async getTopPlans(@Query("limit") limit?: number) {
    return this.installmentPlansService.getTopPlans(limit);
  }

  @Get("date-range")
  @ApiQuery({
    name: "startDate",
    example: "2025-10-01T00:00:00Z",
    description: "Boshlanish sanasi (ISO format)",
  })
  @ApiQuery({
    name: "endDate",
    example: "2025-10-14T23:59:59Z",
    description: "Tugash sanasi (ISO format)",
  })
  async findByDateRange(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ) {
    return this.installmentPlansService.findByDateRange(new Date(startDate), new Date(endDate));
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get single installment plan by ID",
    description: "Returns details of a specific installment plan by ID.",
  })
  @ApiParam({ name: "id", type: Number, description: "Installment Plan ID" })
  @ApiResponse({
    status: 200,
    description: "Installment plan details retrieved successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "Installment plan not found.",
  })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.installmentPlansService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update installment plan through ID (Only Admin)",
    description: "Updates installment plan details by given ID.",
  })
  @ApiParam({ name: "id", type: Number, description: "Installment Plan ID" })
  @ApiResponse({
    status: 200,
    description: "Installment plan updated successfully!",
  })
  @ApiResponse({
    status: 404,
    description: "Installment plan not found or update failed.",
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateInstallmentDto: UpdateInstallmentPlanDto
  ) {
    return this.installmentPlansService.update(id, updateInstallmentDto);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete installment plan through ID (Only Admin)",
    description: "Deletes installment plan by its ID.",
  })
  @ApiParam({ name: "id", type: Number, description: "Installment Plan ID" })
  @ApiResponse({
    status: 200,
    description: "Installment plan deleted successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "Installment plan not found.",
  })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.installmentPlansService.remove(id);
  }
}
