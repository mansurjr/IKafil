import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { InstallmentPlansService } from "./installment-plans.service";
import { CreateInstallmentPlanDto } from "./dto/create-installment-plan.dto";
import { UpdateInstallmentPlanDto } from "./dto/update-installment-plan.dto";
import { Roles } from "../common/decorators/roles";
import { adminRoles } from "../types";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import { RolesGuard } from "../common/guards/role.guard";

@ApiTags("Installment Plans")
@Controller("installment-plans")
export class InstallmentPlansController {
  constructor(
    private readonly installmentPlansService: InstallmentPlansService
  ) {}

  @Post()
  @Roles(...adminRoles)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  findAll() {
    return this.installmentPlansService.findAll();
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
  @Roles(...adminRoles)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles(...adminRoles)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
