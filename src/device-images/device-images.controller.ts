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
import { DeviceImagesService } from "./device-images.service";
import { CreateDeviceImageDto } from "./dto/create-device-image.dto";
import { UpdateDeviceImageDto } from "./dto/update-device-image.dto";

@ApiTags("Device Images") 
@Controller("device-images")
export class DeviceImagesController {
  constructor(private readonly deviceImagesService: DeviceImagesService) {}

  @Post()
  @ApiOperation({ summary: "Add a new device image" })
  @ApiResponse({ status: 201, description: "Image successfully created" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  create(@Body() createDeviceImageDto: CreateDeviceImageDto) {
    return this.deviceImagesService.create(createDeviceImageDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all device images" })
  @ApiResponse({ status: 200, description: "List of device images returned" })
  findAll() {
    return this.deviceImagesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a device image by ID" })
  @ApiResponse({ status: 200, description: "Image found" })
  @ApiResponse({ status: 404, description: "Image not found" })
  findOne(@Param("id") id: string) {
    return this.deviceImagesService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update device image information by ID" })
  @ApiResponse({ status: 200, description: "Image updated successfully" })
  @ApiResponse({ status: 404, description: "Image not found" })
  update(
    @Param("id") id: string,
    @Body() updateDeviceImageDto: UpdateDeviceImageDto
  ) {
    return this.deviceImagesService.update(+id, updateDeviceImageDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a device image by ID" })
  @ApiResponse({ status: 200, description: "Image deleted successfully" })
  @ApiResponse({ status: 404, description: "Image not found" })
  remove(@Param("id") id: string) {
    return this.deviceImagesService.remove(+id);
  }
}
