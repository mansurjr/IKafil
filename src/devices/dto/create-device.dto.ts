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
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DeviceType, SaleType, ReceiveType } from "@prisma/client";

export class CreateDeviceDetailsDto {
  @ApiPropertyOptional({ example: "Midnight Blue" })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: "A17 Pro" })
  @IsOptional()
  @IsString()
  cpu?: string;

  @ApiPropertyOptional({ example: "8GB" })
  @IsOptional()
  @IsString()
  ram?: string;

  @ApiPropertyOptional({ example: "256GB" })
  @IsOptional()
  @IsString()
  storage?: string;

  @ApiPropertyOptional({ example: "6.7 inch OLED" })
  @IsOptional()
  @IsString()
  display_size?: string;

  @ApiPropertyOptional({ example: "95%" })
  @IsOptional()
  @IsString()
  battery_health?: string;

  @ApiPropertyOptional({ example: "Yangi, qadoqlangan." })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateDeviceDto {
  @ApiProperty({
    example: "iPhone 15 Pro Max",
    description: "Qurilma nomi (modeli).",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Qurilma turi (DeviceType enum qiymatlaridan biri).",
    enum: DeviceType,
    example: DeviceType.iphone,
  })
  @IsEnum(DeviceType)
  type: DeviceType;

  @ApiPropertyOptional({
    description: "Sotuv turi (SaleType enum qiymatlaridan biri).",
    enum: SaleType,
    example: SaleType.website_sold,
  })
  @IsOptional()
  @IsEnum(SaleType)
  sale_type: SaleType = SaleType.website_sold;

  @ApiPropertyOptional({
    example: 12,
    description: "Sotuvchi foydalanuvchining ID raqami.",
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  seller_id?: number;

  @ApiPropertyOptional({
    example: 5,
    description: "Hudud (region) ID raqami.",
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  region_id?: number;

  @ApiProperty({
    example: "1299.99",
    description: "Qurilmaning asosiy narxi.",
  })
  @IsDecimal()
  base_price: any;

  @ApiPropertyOptional({
    example: true,
    description: "Qurilma aktiv holatda ekanligini bildiradi.",
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @ApiProperty({
    description: "Qurilmani olish turi (pickup yoki delivery).",
    enum: ReceiveType,
    example: ReceiveType.pickup,
  })
  @IsEnum(ReceiveType)
  receive_type: ReceiveType;

  @ApiPropertyOptional({
    example: 3,
    description:
      "Olib ketish (pickup) bolganda tanlanadigan filial (branch) ID raqami.",
  })
  @ValidateIf((o) => o.receive_type === ReceiveType.pickup)
  @IsInt({ message: "branch_id butun son bolishi kerak" })
  @IsPositive({ message: "branch_id musbat son bolishi kerak" })
  branch_id?: number;

  @ApiPropertyOptional({
    description: "Qurilmaning batafsil ma’lumotlari.",
    type: () => CreateDeviceDetailsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDeviceDetailsDto)
  details?: CreateDeviceDetailsDto;
}
