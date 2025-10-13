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
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RegionService } from "./region.service";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";

@ApiTags("Regions")
@Controller("regions")
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  @ApiOperation({ summary: "Create a new region" })
  @ApiResponse({ status: 201, description: "Region successfully created" })
  create(@Body() createRegionDto: CreateRegionDto) {
    return this.regionService.create(createRegionDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all regions" })
  findAll() {
    return this.regionService.findAll();
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update region by ID" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateRegionDto: UpdateRegionDto
  ) {
    return this.regionService.update(id, updateRegionDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete region by ID" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.regionService.remove(id);
  }
}
