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
import { ContractsService } from "./contracts.service";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import { Roles } from "../common/decorators/roles";
import { adminRoles } from "../types";
import { RolesGuard } from "../common/guards/role.guard";

@ApiTags("Contracts")
@Roles(...adminRoles)
@ApiBearerAuth()
@Controller("contracts")
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("verify/:id")
  @ApiOperation({ summary: "Verify contract by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Contract found." })
  @ApiResponse({ status: 404, description: "Contract not found." })
  contractVerify(@Param("id", ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Create a new contract" })
  @ApiBody({ type: CreateContractDto })
  @ApiResponse({ status: 201, description: "Contract successfully created." })
  @ApiResponse({ status: 400, description: "Validation error." })
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get all contracts" })
  @ApiResponse({ status: 200, description: "List of contracts returned." })
  findAll() {
    return this.contractsService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get one contract by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Contract found." })
  @ApiResponse({ status: 404, description: "Contract not found." })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Update contract by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiBody({ type: UpdateContractDto })
  @ApiResponse({ status: 200, description: "Contract successfully updated." })
  @ApiResponse({ status: 404, description: "Contract not found." })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateContractDto: UpdateContractDto
  ) {
    return this.contractsService.update(id, updateContractDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Delete contract by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Contract deleted successfully." })
  @ApiResponse({ status: 404, description: "Contract not found." })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.contractsService.remove(id);
  }
}
