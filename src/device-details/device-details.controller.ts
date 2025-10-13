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
import { ApiTags, ApiOperation, ApiParam, ApiBody } from "@nestjs/swagger";
import { DeviceDetailsService } from "./device-details.service";
import { CreateDeviceDetailDto } from "./dto/create-device-detail.dto";
import { UpdateDeviceDetailDto } from "./dto/update-device-detail.dto";

@ApiTags("Device Details")
@Controller("device-details")
export class DeviceDetailsController {
  constructor(private readonly deviceDetailsService: DeviceDetailsService) {}

  @Get(":deviceId")
  @ApiOperation({ summary: "Get device details by device ID" })
  @ApiParam({ name: "deviceId", type: Number })
  findOne(@Param("deviceId", ParseIntPipe) deviceId: number) {
    return this.deviceDetailsService.findOne(deviceId);
  }

  @Patch(":deviceId")
  @ApiOperation({ summary: "Update or create device details by device ID" })
  @ApiParam({ name: "deviceId", type: Number })
  @ApiBody({ type: UpdateDeviceDetailDto })
  update(
    @Param("deviceId", ParseIntPipe) deviceId: number,
    @Body() updateDeviceDetailDto: UpdateDeviceDetailDto
  ) {
    return this.deviceDetailsService.update(deviceId, updateDeviceDetailDto);
  }
}
