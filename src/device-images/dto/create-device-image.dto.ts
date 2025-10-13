import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsNumber, IsPositive } from "class-validator";

export class CreateDeviceImageDto {
  @ApiProperty({
    example: 1,
    description: "Qaysi qurilmaga tegishli rasm (device ID)",
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  device_id: number;

  @ApiProperty({
    example: true,
    description: "Bu asosiy rasmmi? (true/false)",
  })
  @Transform(({ value }) => value === "true" || value === true)
  is_primary?: boolean;
}
