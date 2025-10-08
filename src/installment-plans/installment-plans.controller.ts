import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { InstallmentPlansService } from "./installment-plans.service";
import { CreateInstallmentPlanDto } from "./dto/create-installment-plan.dto";
import { UpdateInstallmentPlanDto } from "./dto/update-installment-plan.dto";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Installment plans")
@Controller("installment-plans")
export class InstallmentPlansController {
  constructor(
    private readonly installmentPlansService: InstallmentPlansService
  ) {}

  @Post()
  @ApiOperation({ summary: "Create new installment plan (Only Admin)" })
  @ApiResponse({
    status: 201,
    description: "New installment plan created successfully!",
  })
  @ApiResponse({
    status: 400,
    description: "Something wrong with create installment plan!",
  })
  create(@Body() createInstallmentPlanDto: CreateInstallmentPlanDto) {
    return this.installmentPlansService.create(createInstallmentPlanDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all installment plans (Only Admin)" })
  @ApiResponse({
    status: 200,
    description: "All installment plans",
  })
  findAll() {
    return this.installmentPlansService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get installment plan through ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Installment plan" })
  @ApiResponse({ status: 404, description: "Installment plan not found" })
  findOne(@Param("id") id: string) {
    return this.installmentPlansService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update installment plan through ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({
    status: 200,
    description: "Installment plan updated successfully!",
  })
  @ApiResponse({
    status: 404,
    description: "Something went wrong in update",
  })
  update(
    @Param("id") id: string,
    @Body() updateInstallmentDto: UpdateInstallmentPlanDto
  ) {
    return this.installmentPlansService.update(+id, updateInstallmentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete installment plan through ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({
    status: 200,
    description: "Installment plan deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Installment plan not found" })
  remove(@Param("id") id: string) {
    return this.installmentPlansService.remove(+id);
  }
}
