import { ApiProperty } from "@nestjs/swagger";

export class CreateDeviceDetailDto {
  @ApiProperty({ example: "Silver" })
  color: string;

  @ApiProperty({ example: 2023 })
  year: number;

  @ApiProperty({ example: "Intel i7" })
  cpu: string;

  @ApiProperty({ example: "128GB" })
  ram: string;

  @ApiProperty({ example: 10 })
  device_id: number;

  @ApiProperty({ example: "512GB" })
  storage: string;

  @ApiProperty({ example: '15.6"' })
  display_size: string;

  @ApiProperty({ example: "85%" })
  battery_health: string;

  @ApiProperty({ example: "Lightweight and fast", required: false })
  description?: string;
}
