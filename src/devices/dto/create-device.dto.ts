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
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DeviceType, SaleType } from "@prisma/client";

export class CreateDeviceDetailsDto {
  @ApiPropertyOptional({
    example: "Midnight Blue",
    description: "Qurilmaning rangi (masalan, Midnight Blue, Silver, Gold).",
  })
  @IsOptional()
  @IsString({ message: "color matn (string) bolishi kerak" })
  color?: string;

  @ApiPropertyOptional({
    example: 2024,
    description: "Qurilmaning ishlab chiqarilgan yili.",
  })
  @IsOptional()
  @IsInt({ message: "year butun son (integer) bolishi kerak" })
  year?: number;

  @ApiPropertyOptional({
    example: "Snapdragon 8 Gen 2",
    description: "Qurilmaning protsessori (CPU) nomi.",
  })
  @IsOptional()
  @IsString({ message: "cpu matn (string) bolishi kerak" })
  cpu?: string;

  @ApiPropertyOptional({
    example: "12GB",
    description: "Operativ xotira (RAM) hajmi.",
  })
  @IsOptional()
  @IsString({ message: "ram matn (string) bolishi kerak" })
  ram?: string;

  @ApiPropertyOptional({
    example: "512GB",
    description: "Doimiy xotira (Storage) hajmi.",
  })
  @IsOptional()
  @IsString({ message: "storage matn (string) bolishi kerak" })
  storage?: string;

  @ApiPropertyOptional({
    example: "6.7 inch AMOLED",
    description: "Ekran hajmi va turi (masalan, 6.7 inch AMOLED).",
  })
  @IsOptional()
  @IsString({ message: "display_size matn (string) bolishi kerak" })
  display_size?: string;

  @ApiPropertyOptional({
    example: "94%",
    description: "Batareya holati (Battery Health), foiz korinishida.",
  })
  @IsOptional()
  @IsString({ message: "battery_health matn (string) bolishi kerak" })
  battery_health?: string;

  @ApiPropertyOptional({
    example: "Yangi holatda, qadoqlangan.",
    description: "Qurilma haqida umumiy tavsif yoki izoh.",
  })
  @IsOptional()
  @IsString({ message: "description matn (string) bolishi kerak" })
  description?: string;
}

export class CreateDeviceDto {
  @ApiProperty({
    example: "iPhone 15 Pro Max",
    description: "Qurilma nomi (modeli).",
  })
  @IsString({ message: "name matn (string) bolishi kerak" })
  name: string;

  @ApiProperty({
    description: "Qurilma turi (`DeviceType` enum qiymatlaridan biri).",
    enum: DeviceType,
    example: DeviceType.iphone,
  })
  @IsEnum(DeviceType, {
    message: "type faqat DeviceType enum qiymatlaridan biri bolishi kerak",
  })
  type: DeviceType;

  @ApiPropertyOptional({
    description:
      "Sotuv turi (`SaleType` enum qiymatlaridan biri). Standart qiymat: `website_sold`.",
    enum: SaleType,
    example: SaleType.website_sold,
  })
  @IsOptional()
  @IsEnum(SaleType, {
    message: "sale_type faqat SaleType enum qiymatlaridan biri bolishi kerak",
  })
  sale_type: SaleType = SaleType.website_sold;

  @ApiPropertyOptional({
    example: 12,
    description: "Sotuvchi foydalanuvchining ID raqami (agar mavjud bolsa).",
  })
  @IsOptional()
  @IsInt({ message: "seller_id butun son (integer) bolishi kerak" })
  @IsPositive({
    message: "seller_id musbat son (positive integer) bolishi kerak",
  })
  seller_id?: number;

  @ApiPropertyOptional({
    example: 5,
    description: "Hudud (region) ID raqami (agar mavjud bolsa).",
  })
  @IsOptional()
  @IsInt({ message: "region_id butun son (integer) bolishi kerak" })
  @IsPositive({
    message: "region_id musbat son (positive integer) bolishi kerak",
  })
  region_id?: number;

  @ApiProperty({
    example: "1299.99",
    description:
      "Qurilmaning asosiy (bazaviy) narxi. Decimal formatda kiritiladi.",
  })
  @IsDecimal(
    {},
    { message: "base_price haqiqiy (decimal) raqam bolishi kerak" }
  )
  base_price: any;

  @ApiPropertyOptional({
    example: true,
    description:
      "Qurilma aktiv holatda ekanligini bildiradi. Standart qiymat: `true`.",
  })
  @IsOptional()
  @IsBoolean({
    message: "is_active boolean (true yoki false) qiymat bolishi kerak",
  })
  is_active?: boolean = true;

  @ApiPropertyOptional({
    description:
      "Qurilmaning batafsil texnik ma’lumotlari (ichki obyekt sifatida yuboriladi).",
    type: () => CreateDeviceDetailsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDeviceDetailsDto)
  details?: CreateDeviceDetailsDto;
}
