import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
} from "@nestjs/swagger";

@ApiTags("Contracts")
@Controller("contracts")
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get("verify/:id")
  @ApiOperation({ summary: "Verify contract by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Contract found." })
  @ApiResponse({ status: 404, description: "Contract not found." })
  contractVerify(@Param("id") id: string) {
    return this.contractsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new contract" })
  @ApiBody({ type: CreateContractDto })
  @ApiResponse({ status: 201, description: "Contract successfully created." })
  @ApiResponse({ status: 400, description: "Validation error." })
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all contracts" })
  @ApiResponse({ status: 200, description: "List of contracts returned." })
  findAll() {
    return this.contractsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one contract by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Contract found." })
  @ApiResponse({ status: 404, description: "Contract not found." })
  findOne(@Param("id") id: string) {
    return this.contractsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update contract by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiBody({ type: UpdateContractDto })
  @ApiResponse({ status: 200, description: "Contract successfully updated." })
  @ApiResponse({ status: 404, description: "Contract not found." })
  update(
    @Param("id") id: string,
    @Body() updateContractDto: UpdateContractDto
  ) {
    return this.contractsService.update(+id, updateContractDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete contract by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Contract deleted successfully." })
  @ApiResponse({ status: 404, description: "Contract not found." })
  remove(@Param("id") id: string) {
    return this.contractsService.remove(+id);
  }
}
