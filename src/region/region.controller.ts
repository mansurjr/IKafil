import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { RegionService } from "./region.service";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";

@ApiTags("Regions")
@Controller("regions")
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new region",
    description:
      "Creates a new region in the system with provided name and other details.",
  })
  @ApiBody({ type: CreateRegionDto, description: "Region creation data" })
  @ApiResponse({
    status: 201,
    description: "Region successfully created.",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data.",
  })
  create(@Body() createRegionDto: CreateRegionDto) {
    return this.regionService.create(createRegionDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all regions",
    description: "Retrieves a list of all regions available in the database.",
  })
  @ApiResponse({
    status: 200,
    description: "List of all regions retrieved successfully.",
  })
  findAll() {
    return this.regionService.findAll();
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update region by ID",
    description: "Updates specific region data based on its ID.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Unique ID of the region to update.",
  })
  @ApiBody({ type: UpdateRegionDto, description: "Updated region data" })
  @ApiResponse({
    status: 200,
    description: "Region updated successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "Region not found.",
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateRegionDto: UpdateRegionDto
  ) {
    return this.regionService.update(id, updateRegionDto);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete region by ID",
    description: "Deletes a region from the database by its ID.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Unique ID of the region to delete.",
  })
  @ApiResponse({
    status: 200,
    description: "Region deleted successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "Region not found.",
  })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.regionService.remove(id);
  }
}
