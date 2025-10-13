import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiBody } from "@nestjs/swagger";
import { DeviceDetailsService } from "./device-details.service";
import { CreateDeviceDetailDto } from "./dto/create-device-detail.dto";
import { UpdateDeviceDetailDto } from "./dto/update-device-detail.dto";

@ApiTags("Device Details")
@Controller("device-details")
export class DeviceDetailsController {
  constructor(private readonly deviceDetailsService: DeviceDetailsService) {}
  @Post()
  @ApiOperation({ summary: "Create a new device detail" })
  @ApiBody({ type: CreateDeviceDetailDto })
  create(@Body() createDeviceDetailDto: CreateDeviceDetailDto) {
    return this.deviceDetailsService.create(createDeviceDetailDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all device details" })
  findAll() {
    return this.deviceDetailsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a device detail by ID" })
  @ApiParam({ name: "id", type: Number })
  findOne(@Param("id") id: string) {
    return this.deviceDetailsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a device detail by ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiBody({ type: UpdateDeviceDetailDto })
  update(
    @Param("id") id: string,
    @Body() updateDeviceDetailDto: UpdateDeviceDetailDto
  ) {
    return this.deviceDetailsService.update(+id, updateDeviceDetailDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a device detail by ID" })
  @ApiParam({ name: "id", type: Number })
  remove(@Param("id") id: string) {
    return this.deviceDetailsService.remove(+id);
  }
}
