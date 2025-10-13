import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsNumber, IsPositive, IsOptional } from "class-validator";

export class CreateDeviceImageDto {
  @ApiProperty({
    example: 1,
    description:
      "Rasm tegishli bo‘lgan qurilmaning ID raqami (`devices` jadvalidan olinadi).",
  })
  @Type(() => Number)
  @IsNumber({}, { message: "device_id raqam (number) bo‘lishi kerak" })
  @IsPositive({
    message: "device_id musbat son (positive number) bo‘lishi kerak",
  })
  device_id: number;

  @ApiPropertyOptional({
    example: true,
    description:
      "Rasm asosiy rasm ekanligini bildiradi. `true` — asosiy, `false` — oddiy rasm.",
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean({
    message: "is_primary faqat boolean (true yoki false) qiymat bo‘lishi kerak",
  })
  is_primary?: boolean;
}
