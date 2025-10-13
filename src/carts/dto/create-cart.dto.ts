import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional } from "class-validator";

export class CreateCartDto {
  @ApiProperty({
    example: 5,
    description: "Device ID (qurilma identifikatori)",
  })
  @IsInt({ message: "device_id butun son bo‘lishi kerak" })
  device_id: number;
}
