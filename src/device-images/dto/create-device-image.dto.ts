import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsPositive,
  IsString,
  IsUrl,
} from "class-validator";

export class CreateDeviceImageDto {
  @ApiProperty({
    example: 1,
    description: "Qaysi qurilmaga tegishli rasm (device ID)",
  })
  @IsNumber()
  @IsPositive()
  device_id: number;

  @ApiProperty({
    example: "https://cdn.ikafil.uz/images/device1.jpg",
    description: "Rasmning URL manzili",
  })
  @IsString()
  @IsUrl()
  url: string;

  @ApiProperty({
    example: true,
    description: "Asosiy rasmmi yo'qmi (true/false)",
  })
  @IsBoolean()
  is_primary: boolean;
}
