import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiConsumes,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { DeviceImagesService } from "./device-images.service";
import { CreateDeviceImageDto } from "./dto/create-device-image.dto";
import { UpdateDeviceImageDto } from "./dto/update-device-image.dto";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import { RolesGuard } from "../common/guards/role.guard";
import { Roles } from "../common/decorators/roles";
import { adminRoles } from "../types";

@ApiTags("Device Images")
@Roles(...adminRoles)
@Controller("device-images")
export class DeviceImagesController {
  constructor(private readonly deviceImagesService: DeviceImagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload a new device image" })
  @ApiBody({
    description: "Upload a new device image",
    schema: {
      type: "object",
      properties: {
        device_id: { type: "number", example: 1 },
        is_primary: { type: "boolean", example: true },
        file: { type: "string", format: "binary" },
      },
      required: ["device_id", "file"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Device image successfully uploaded.",
  })
  @ApiResponse({ status: 400, description: "Validation error." })
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDeviceImageDto
  ) {
    return this.deviceImagesService.create(dto, file);
  }

  @Get(":deviceId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get all images of a specific device" })
  @ApiParam({ name: "deviceId", type: Number, required: true, example: 1 })
  @ApiResponse({ status: 200, description: "List of device images returned." })
  @ApiResponse({
    status: 404,
    description: "Device not found or no images available.",
  })
  getDeviceImages(@Param("deviceId", ParseIntPipe) deviceId: number) {
    return this.deviceImagesService.getDeviceImagesById(deviceId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update device image details" })
  @ApiParam({ name: "id", type: Number, required: true, example: 1 })
  @ApiBody({ type: UpdateDeviceImageDto })
  @ApiResponse({
    status: 200,
    description: "Device image successfully updated.",
  })
  @ApiResponse({ status: 400, description: "Validation error." })
  @ApiResponse({ status: 404, description: "Device image not found." })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDeviceImageDto
  ) {
    return this.deviceImagesService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete device image by ID" })
  @ApiParam({ name: "id", type: Number, required: true, example: 1 })
  @ApiResponse({
    status: 200,
    description: "Device image deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "Device image not found." })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.deviceImagesService.remove(id);
  }
}
