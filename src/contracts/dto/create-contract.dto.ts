import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsEnum,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ContractStatus } from "@prisma/client";

export class CreateContractDto {
  @ApiProperty({
    example: 1,
    description:
      "Xaridor (buyer) foydalanuvchining ID raqami. Bu qiymat `users` jadvalidan olinadi.",
  })
  @IsInt({ message: "buyer_id butun son (integer) bolishi kerak" })
  buyer_id: number;

  @ApiProperty({
    example: 5,
    description:
      "Shartnoma boglanadigan qurilmaning ID raqami (`devices` jadvalidan).",
  })
  @IsInt({ message: "device_id butun son (integer) bolishi kerak" })
  device_id: number;

  @ApiProperty({
    example: 2,
    description: "Shartnomani yaratgan adminning ID raqami.",
    required: false,
  })
  @IsOptional()
  @IsInt({ message: "admin_id butun son (integer) bolishi kerak" })
  admin_id?: number;

  @ApiProperty({
    example: 3,
    description:
      "Tolov rejasining (installment plan) ID raqami, agar mavjud bolsa.",
    required: false,
  })
  @IsOptional()
  @IsInt({ message: "plan_id butun son (integer) bolishi kerak" })
  plan_id?: number;

  @ApiProperty({
    example: 1200000,
    description:
      "Trade-in qiymati (somda). Agar shartnoma trade-in asosida bolsa, bu qiymat kiritiladi.",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "trade_in_value raqam bolishi kerak" })
  @Min(0, { message: "trade_in_value manfiy bolmasligi kerak" })
  trade_in_value?: number;

  @ApiProperty({
    description: "Shartnoma holati (`ContractStatus` enum qiymatlari).",
    enum: ContractStatus,
    example: ContractStatus.active,
    default: ContractStatus.active,
  })
  @IsOptional()
  @IsEnum(ContractStatus, {
    message: "status ContractStatus enum qiymatlaridan biri bolishi kerak",
  })
  status?: ContractStatus;

  @ApiProperty({
    example: "2025-10-07T00:00:00Z",
    description: "Shartnoma boshlanish sanasi (ISO formatda).",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "start_date ISO formatda bolishi kerak" })
  start_date?: Date;

  @ApiProperty({
    example: "2026-10-07T00:00:00Z",
    description: "Shartnoma tugash sanasi (ISO formatda).",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "end_date ISO formatda bolishi kerak" })
  end_date?: Date;

  @ApiProperty({
    example: false,
    description:
      "Agar shartnoma trade-in asosida tuzilgan bolsa — `true`, aks holda `false`.",
    required: false,
  })
  @IsOptional()
  @IsBoolean({
    message: "is_trade_in boolean (true yoki false) qiymat bolishi kerak",
  })
  is_trade_in?: boolean;
}
