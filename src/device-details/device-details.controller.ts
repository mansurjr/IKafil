import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { DeviceDetailsService } from "./device-details.service";
import { UpdateDeviceDetailDto } from "./dto/update-device-detail.dto";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import { Roles } from "../common/decorators/roles";
import { adminRoles } from "../types";


@Controller("device-details")
export class DeviceDetailsController {
  constructor(private readonly deviceDetailsService: DeviceDetailsService) { }

  @Get(":deviceId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get device details by device ID" })
  @ApiParam({ name: "deviceId", type: Number, required: true, example: 1 })
  @ApiResponse({ status: 200, description: "Device details found." })
  @ApiResponse({ status: 404, description: "Device not found." })
  @ApiResponse({
    status: 400,
    description: "Validation failed (numeric string is expected)",
  })
  findOne(@Param("deviceId", ParseIntPipe) deviceId: number) {
    return this.deviceDetailsService.findOne(deviceId);
  }

  @ApiTags("Device Details")
  @Patch(":deviceId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update or create device details by device ID" })
  @ApiParam({ name: "deviceId", type: Number, required: true, example: 1 })
  @ApiBody({ type: UpdateDeviceDetailDto })
  @ApiResponse({
    status: 200,
    description: "Device details updated or created.",
  })
  @ApiResponse({ status: 400, description: "Validation error." })
  update(
    @Param("deviceId", ParseIntPipe) deviceId: number,
    @Body() updateDeviceDetailDto: UpdateDeviceDetailDto
  ) {
    return this.deviceDetailsService.update(deviceId, updateDeviceDetailDto);
  }
}
