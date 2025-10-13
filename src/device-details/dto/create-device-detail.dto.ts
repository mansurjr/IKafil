import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber } from "class-validator";

export class CreateDeviceDetailDto {
  @ApiPropertyOptional({
    example: "Space Gray",
    description: "Qurilmaning rangi (masalan, Space Gray, Silver, Gold).",
  })
  @IsOptional()
  @IsString({ message: "color matn (string) bo‘lishi kerak" })
  color?: string;

  @ApiPropertyOptional({
    example: 2023,
    description: "Qurilmaning ishlab chiqarilgan yili.",
  })
  @IsOptional()
  @IsNumber({}, { message: "year raqam (number) bo‘lishi kerak" })
  year?: number;

  @ApiPropertyOptional({
    example: "Apple A16 Bionic",
    description: "Qurilmada ishlatilgan markaziy protsessor (CPU) nomi.",
  })
  @IsOptional()
  @IsString({ message: "cpu matn (string) bo‘lishi kerak" })
  cpu?: string;

  @ApiPropertyOptional({
    example: "8GB",
    description: "Operativ xotira (RAM) hajmi.",
  })
  @IsOptional()
  @IsString({ message: "ram matn (string) bo‘lishi kerak" })
  ram?: string;

  @ApiPropertyOptional({
    example: "256GB",
    description: "Doimiy xotira (Storage) hajmi.",
  })
  @IsOptional()
  @IsString({ message: "storage matn (string) bo‘lishi kerak" })
  storage?: string;

  @ApiPropertyOptional({
    example: "6.1 inch OLED",
    description: "Ekran hajmi va turi (masalan, 6.1 inch OLED).",
  })
  @IsOptional()
  @IsString({ message: "display_size matn (string) bo‘lishi kerak" })
  display_size?: string;

  @ApiPropertyOptional({
    example: "95%",
    description: "Batareya sog‘lomligi (Battery Health). Foizda ifodalanadi.",
  })
  @IsOptional()
  @IsString({ message: "battery_health matn (string) bo‘lishi kerak" })
  battery_health?: string;

  @ApiPropertyOptional({
    example: "Hech qanday nuqsoni yo‘q, holati a’lo.",
    description: "Qurilma haqida umumiy tavsif yoki izoh.",
  })
  @IsOptional()
  @IsString({ message: "description matn (string) bo‘lishi kerak" })
  description?: string;
}
