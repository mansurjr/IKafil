import { ApiProperty } from "@nestjs/swagger";
import { DeviceStatus, DeviceType, SaleType } from "@prisma/client";

export class CreateDeviceDto {
  @ApiProperty({ example: "iPhone 14 Pro" })
  name: string;

  @ApiProperty({ enum: DeviceType, example: DeviceType.iphone })
  type: DeviceType;

  @ApiProperty({ enum: SaleType, example: SaleType.website_sold })
  sale_type: SaleType;

  @ApiProperty({ enum: DeviceStatus, example: DeviceStatus.approved })
  status: DeviceStatus;

  @ApiProperty({ example: 101 })
  seller_id: number;

  @ApiProperty({ example: 5 })
  region_id: number;

  @ApiProperty({ example: 999.99 })
  base_price: number;

  @ApiProperty({ example: 202 })
  details_id: number;

  @ApiProperty({ example: true })
  is_active: boolean;
}
