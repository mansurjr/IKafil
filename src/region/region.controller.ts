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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { RegionService } from "./region.service";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import { RolesGuard } from "../common/guards/role.guard";
import { Roles } from "../common/decorators/roles";
import { UserRole } from "@prisma/client";

@ApiTags("Regions")
@Controller("regions")
export class RegionController {
  constructor(private readonly regionService: RegionService) { }

  @ApiBearerAuth()
  @Roles(UserRole.admin, UserRole.superadmin)
  @Post()
  @ApiOperation({
    summary: "Create a new region",
    description: "Creates a new region in the system.",
  })
  @ApiBody({ type: CreateRegionDto })
  @ApiResponse({ status: 201, description: "Region successfully created." })
  @ApiResponse({ status: 400, description: "Invalid input data." })
  create(@Body() createRegionDto: CreateRegionDto) {
    return this.regionService.create(createRegionDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all regions",
    description: "Retrieves a list of all regions.",
  })
  @ApiResponse({
    status: 200,
    description: "List of all regions retrieved successfully.",
  })
  findAll() {
    return this.regionService.findAll();
  }

  @Roles(UserRole.admin, UserRole.superadmin)
  @Patch(":id")
  @ApiOperation({
    summary: "Update region by ID",
    description: "Updates a region based on its ID.",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiBody({ type: UpdateRegionDto })
  @ApiResponse({ status: 200, description: "Region updated successfully." })
  @ApiResponse({ status: 404, description: "Region not found." })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateRegionDto: UpdateRegionDto
  ) {
    return this.regionService.update(id, updateRegionDto);
  }

  @Roles(UserRole.superadmin, UserRole.admin)
  @Delete(":id")
  @ApiOperation({
    summary: "Delete region by ID",
    description: "Deletes a region from the system by its ID.",
  })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Region deleted successfully." })
  @ApiResponse({ status: 404, description: "Region not found." })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.regionService.remove(id);
  }
}
