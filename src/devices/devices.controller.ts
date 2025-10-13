import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  Query,
  UseGuards,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from "@nestjs/swagger";
import { DevicesService } from "./devices.service";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";
import { Express } from "express";
import { DeviceSaleStatus } from "@prisma/client";
import { GetCurrentUser } from "../common/decorators/getCurrentUser";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";

@ApiTags("Devices")
@Controller("devices")
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor("images"))
  @ApiOperation({ summary: "Create a new device (with optional images)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Device data with optional images",
    type: CreateDeviceDto,
  })
  @ApiResponse({ status: 201, description: "Device successfully created." })
  @ApiResponse({ status: 400, description: "Validation error." })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() createDeviceDto: any,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    // Parse details JSON if passed as string
    if (typeof createDeviceDto.details === "string") {
      try {
        createDeviceDto.details = JSON.parse(createDeviceDto.details);
      } catch {
        throw new BadRequestException('Invalid JSON format in "details" field');
      }
    }
    return this.devicesService.create(createDeviceDto, files);
  }

  @Get()
  @ApiOperation({ summary: "Get all devices" })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    example: "iPhone",
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  findAll(
    @Query("search") search?: string,
    @Query("page", ParseIntPipe) page = 1,
    @Query("limit", ParseIntPipe) limit = 10
  ) {
    return this.devicesService.findAll(search, page, limit);
  }
  @Get("seller/own")
  @ApiOperation({ summary: "Get seller's own devices by status" })
  @ApiParam({ name: "sellerId", type: Number })
  @ApiQuery({
    name: "isActive",
    required: false,
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: "saleStatus",
    required: false,
    enum: DeviceSaleStatus,
  })
  @UseGuards(JwtAuthGuard)
  async getOwnDevices(
    @GetCurrentUser("id") sellerId: number,
    @Query("isActive") isActive?: boolean,
    @Query("saleStatus") saleStatus?: DeviceSaleStatus
  ) {
    return this.devicesService.getOwnDevicesByStatus(sellerId, {
      isActive,
      saleStatus,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get device by ID" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiResponse({ status: 200, description: "Device details returned." })
  @ApiResponse({ status: 404, description: "Device not found." })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.devicesService.findOne(id);
  }

  @Put(":id")
  @UseInterceptors(FilesInterceptor("images"))
  @ApiOperation({ summary: "Update device (with optional new images)" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiBody({
    description: "Updated device data with optional images",
    type: UpdateDeviceDto,
  })
  @ApiResponse({ status: 200, description: "Device successfully updated." })
  @ApiResponse({ status: 404, description: "Device not found." })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    // Parse details JSON if passed as string
    if (typeof updateDeviceDto.details === "string") {
      try {
        updateDeviceDto.details = JSON.parse(updateDeviceDto.details);
      } catch {
        throw new BadRequestException('Invalid JSON format in "details" field');
      }
    }
    return this.devicesService.update(id, updateDeviceDto, files);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a device by ID" })
  @ApiParam({ name: "id", type: Number, example: 1 })
  @ApiResponse({ status: 200, description: "Device successfully deleted." })
  @ApiResponse({ status: 404, description: "Device not found." })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.devicesService.remove(id);
  }
}
