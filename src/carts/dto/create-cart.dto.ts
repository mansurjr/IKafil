import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional } from "class-validator";

export class CreateCartDto {
  @ApiProperty({
    example: 5,
    description:
      "Qoshilayotgan qurilmaning ID raqami. Bu ID `devices` jadvalidan olinadi.",
  })
  @IsInt({ message: "device_id butun son (integer) bolishi kerak" })
  device_id: number;
}
