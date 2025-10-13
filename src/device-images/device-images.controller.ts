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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { DeviceImagesService } from "./device-images.service";
import { CreateDeviceImageDto } from "./dto/create-device-image.dto";
import { UpdateDeviceImageDto } from "./dto/update-device-image.dto";

@ApiTags("Device Images")
@Controller("device-images")
export class DeviceImagesController {
  constructor(private readonly deviceImagesService: DeviceImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Upload new device image",
    schema: {
      type: "object",
      properties: {
        device_id: { type: "number", example: 1 },
        is_primary: { type: "boolean", example: true },
        file: { type: "string", format: "binary" },
      },
    },
  })
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDeviceImageDto
  ) {
    return this.deviceImagesService.create(dto, file);
  }

  @Get(":deviceId")
  getDeviceImages(@Param("deviceId", ParseIntPipe) deviceId: number) {
    return this.deviceImagesService.getDeviceImagesById(deviceId);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDeviceImageDto
  ) {
    return this.deviceImagesService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.deviceImagesService.remove(id);
  }
}
