import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsEnum,
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
    example: 4,
    description:
      "Trade-in sorovi ID raqami, agar shartnoma trade-in orqali tuzilgan bolsa.",
    required: false,
  })
  @IsOptional()
  @IsInt({ message: "trade_in_id butun son (integer) bolishi kerak" })
  trade_in_id?: number;

  @ApiProperty({
    example: 1200.5,
    description: "Shartnoma boyicha jami tolov summasi (USD yoki somda).",
  })
  @Type(() => Number)
  @IsNumber({}, { message: "total_price raqam (number) bolishi kerak" })
  total_price: number;

  @ApiProperty({
    example: 100.42,
    description: "Har oylik tolov miqdori.",
  })
  @Type(() => Number)
  @IsNumber({}, { message: "monthly_payment raqam (number) bolishi kerak" })
  monthly_payment: number;

  @ApiProperty({
    example: 800.25,
    description: "Tolanmagan (qolgan) summa.",
  })
  @Type(() => Number)
  @IsNumber({}, { message: "remaining_balance raqam (number) bolishi kerak" })
  remaining_balance: number;

  @ApiProperty({
    example: 12,
    description: "Shartnomaning davomiyligi (oylarda).",
  })
  @IsInt({ message: "duration_months butun son (integer) bolishi kerak" })
  duration_months: number;

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
  @IsDateString(
    {},
    { message: "start_date togri sana formatida (ISO) bolishi kerak" }
  )
  start_date?: Date;

  @ApiProperty({
    example: "2026-10-07T00:00:00Z",
    description: "Shartnoma tugash sanasi (ISO formatda).",
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: "end_date togri sana formatida (ISO) bolishi kerak" }
  )
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
