import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { UploadService } from "./upload.service";
import { ApiConsumes, ApiBody, ApiTags } from "@nestjs/swagger";

@ApiTags("Upload") 
@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("device-image")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        deviceId: { type: "string" },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/devices",
        filename: (req, file, cb) => {
          const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${unique}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException("Rasm formati bo'lishi kerak"),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  async uploadDeviceImage(
    @UploadedFile() file: Express.Multer.File,
    @Body("deviceId") deviceId: number
  ) {
    if (!file) throw new BadRequestException("Fayl topilmadi");
    if (!deviceId) throw new BadRequestException("deviceId kerak");

    const image = await this.uploadService.saveDeviceImage({
      deviceId: Number(deviceId),
      url: `/uploads/devices/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    });

    return { message: "Device image saqlandi", image };
  }
}
