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
