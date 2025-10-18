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
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBody,
  ApiConsumes,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
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
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller("device-images")
export class DeviceImagesController {
  constructor(private readonly deviceImagesService: DeviceImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload a new device image" })
  @ApiBody({
    description: "Upload a new device image for a specific device",
    schema: {
      type: "object",
      properties: {
        device_id: { type: "number", example: 1 },
        is_primary: { type: "boolean", example: false },
        file: { type: "string", format: "binary" },
      },
      required: ["device_id", "file"],
    },
  })
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateDeviceImageDto
  ) {
    return this.deviceImagesService.create(dto, file);
  }


  @Get(":deviceId")
  @ApiOperation({ summary: "Get all images of a specific device" })
  @ApiParam({ name: "deviceId", type: Number, required: true, example: 1 })
  getDeviceImages(@Param("deviceId", ParseIntPipe) deviceId: number) {
    return this.deviceImagesService.getDeviceImagesById(deviceId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update device image details" })
  @ApiParam({ name: "id", type: Number, required: true, example: 1 })
  @ApiBody({ type: UpdateDeviceImageDto })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDeviceImageDto
  ) {
    return this.deviceImagesService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete device image by ID" })
  @ApiParam({ name: "id", type: Number, required: true, example: 1 })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.deviceImagesService.remove(id);
  }

  @Get("smart/top-devices")
  @ApiOperation({ summary: "Eng ko'p rasmga ega bo'lgan qurilmalar" })
  @ApiQuery({ name: "limit", required: false, example: 5 })
  async getTopImageDevices(@Query("limit") limit = 5) {
    return this.deviceImagesService.getTopImageDevices(Number(limit));
  }

  @Get("smart/empty-devices")
  @ApiOperation({ summary: "Rasmsiz (image yo'q) qurilmalar ro'yxati" })
  async findDevicesWithoutImages() {
    return this.deviceImagesService.findDevicesWithoutImages();
  }

  @Get("smart/top-image-groups")
  @ApiOperation({
    summary:
      "Eng ko'p rasmga ega bo'lgan device guruhlarini olish (device_images asosida)",
  })
  @ApiQuery({ name: "limit", required: false, example: 5 })
  async getTopImageGroups(@Query("limit") limit = 5) {
    return this.deviceImagesService.getTopImageGroups(Number(limit));
  }

  @Get("smart/without-primary")
  @ApiOperation({
    summary: "Primary rasmga ega bo'lmagan device'larni aniqlash",
    description: "is_primary = true rasm yo'q bo'lgan qurilmalarni qaytaradi",
  })
  async getDevicesWithoutPrimaryImage() {
    return this.deviceImagesService.getDevicesWithoutPrimaryImage();
  }

  @Get("smart/broken-files")
  @ApiOperation({
    summary: "Fayl tizimida yo'q bo'lgan rasm fayllarni topish",
    description:
      "DB da bor, lekin uploads/devices papkasida mavjud bo'lmagan rasmlar qaytaradi",
  })
  async findBrokenImageFiles() {
    return this.deviceImagesService.findBrokenImageFiles();
  }
}
