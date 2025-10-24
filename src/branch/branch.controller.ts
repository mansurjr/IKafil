import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { BranchService } from "./branch.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";

@ApiTags("Branches")
@Controller("branches")
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  // 🟢 CREATE
  @Post()
  @ApiOperation({ summary: "Create a new branch" })
  @ApiResponse({ status: 201, description: "Branch successfully created" })
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  // 🟢 GET ALL
  @Get()
  @ApiOperation({ summary: "Get list of all branches" })
  @ApiResponse({ status: 200, description: "List of branches returned" })
  findAll() {
    return this.branchService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get branch by ID" })
  @ApiResponse({ status: 200, description: "Branch found" })
  @ApiResponse({ status: 404, description: "Branch not found" })
  findOne(@Param("id") id: string) {
    return this.branchService.findOne(+id);
  }

  // 🟢 UPDATE
  @Patch(":id")
  @ApiOperation({ summary: "Update an existing branch" })
  @ApiResponse({ status: 200, description: "Branch successfully updated" })
  @ApiResponse({ status: 404, description: "Branch not found" })
  update(@Param("id") id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(+id, updateBranchDto);
  }

  // 🟢 DELETE
  @Delete(":id")
  @ApiOperation({ summary: "Delete a branch" })
  @ApiResponse({ status: 200, description: "Branch successfully deleted" })
  @ApiResponse({ status: 404, description: "Branch not found" })
  remove(@Param("id") id: string) {
    return this.branchService.remove(+id);
  }
}
