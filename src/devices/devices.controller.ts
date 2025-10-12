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
} from "@nestjs/common";
import { DevicesService } from "./devices.service";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { Express } from "express";

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
    if (typeof createDeviceDto.details === "string") {
      try {
        createDeviceDto.details = JSON.parse(createDeviceDto.details);
      } catch (e) {
        throw new BadRequestException('Invalid JSON format in "details" field');
      }
    }
    return this.devicesService.create(createDeviceDto, files);
  }

  @Get()
  @ApiOperation({ summary: "Get all devices" })
  @ApiResponse({ status: 200, description: "List of devices." })
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get device by ID" })
  @ApiResponse({ status: 200, description: "Device details." })
  @ApiResponse({ status: 404, description: "Device not found." })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.devicesService.findOne(id);
  }

  @Put(":id")
  @UseInterceptors(FilesInterceptor("images"))
  @ApiOperation({ summary: "Update a device (optionally upload new images)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Updated device data (with optional new images)",
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
    return this.devicesService.update(id, updateDeviceDto, files);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a device" })
  @ApiResponse({ status: 200, description: "Device successfully deleted." })
  @ApiResponse({ status: 404, description: "Device not found." })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.devicesService.remove(id);
  }
}
