import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDecimal,
  IsNumber,
  ValidateNested,
  IsInt,
  IsPositive,
} from "class-validator";
import { Type } from "class-transformer";
import { DeviceType, SaleType, DeviceStatus } from "@prisma/client";

export class CreateDeviceDetailsDto {
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  cpu?: string;

  @IsOptional()
  @IsString()
  ram?: string;

  @IsOptional()
  @IsString()
  storage?: string;

  @IsOptional()
  @IsString()
  display_size?: string;

  @IsOptional()
  @IsString()
  battery_health?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateDeviceDto {
  @IsString()
  name: string;

  @IsEnum(DeviceType)
  type: DeviceType;

  @IsOptional()
  @IsEnum(SaleType)
  sale_type: SaleType = SaleType.website_sold;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus = DeviceStatus.pending_approval;

  @IsInt()
  @IsOptional()
  seller_id?: number;

  @IsInt()
  @IsOptional()
  region_id?: number;

  @IsDecimal({}, { message: "Base price must be a valid decimal number" })
  base_price: any;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDeviceDetailsDto)
  details?: CreateDeviceDetailsDto;
}
