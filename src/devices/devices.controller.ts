import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { DevicesService } from "./devices.service";
import { CreateDeviceDto } from "./dto/create-device.dto";
import { UpdateDeviceDto } from "./dto/update-device.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { DeviceStatus } from "@prisma/client";

@ApiTags("Devices")
@Controller("devices")
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new device" })
  @ApiResponse({ status: 201, description: "Device successfully created" })
  @ApiBody({ type: CreateDeviceDto })
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @ApiOperation({ summary: "Search device according to the status" })
  @ApiResponse({ status: 201, description: "Devices with the wanted status" })
  @Get(":status")
  getFiltered(@Param("status") status: string) {
    if (!Object.values(DeviceStatus).includes(status as DeviceStatus)) {
      throw new BadRequestException("Invalid status value");
    }

    return this.devicesService.findFilteredDevices({
      status: status as DeviceStatus,
    });
  }

  @Get()
  @ApiOperation({ summary: "Get all devices" })
  @ApiResponse({ status: 200, description: "List of all devices" })
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a device by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Device details" })
  findOne(@Param("id") id: string) {
    return this.devicesService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a device by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiBody({ type: UpdateDeviceDto })
  @ApiResponse({ status: 200, description: "Device successfully updated" })
  update(@Param("id") id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(+id, updateDeviceDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a device by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Device successfully removed" })
  remove(@Param("id") id: string) {
    return this.devicesService.remove(+id);
  }
}
