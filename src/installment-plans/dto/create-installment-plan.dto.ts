import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateInstallmentPlanDto {
  @ApiProperty({
    example: 6,
    description:
      "To‘lov muddatining davomiyligi (oylarda). Masalan: 6, 12 yoki 18 oy.",
  })
  @Type(() => Number)
  @IsNumber({}, { message: "months raqam (number) bo‘lishi kerak" })
  @IsPositive({ message: "months musbat son (positive number) bo‘lishi kerak" })
  months: number;

  @ApiProperty({
    example: 10,
    description: "Foiz stavkasi (raqamda, % belgisisiz). Masalan: 10 → 10%.",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "percent raqam (number) bo‘lishi kerak" })
  @IsPositive({
    message: "percent musbat son (positive number) bo‘lishi kerak",
  })
  percent?: number;

  @ApiProperty({
    example: 25,
    description:
      "Boshlang‘ich to‘lov miqdori (foizda, % belgisisiz). Masalan: 25 → 25%.",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    { message: "first_payment_percent raqam (number) bo‘lishi kerak" }
  )
  @IsPositive({
    message:
      "first_payment_percent musbat son (positive number) bo‘lishi kerak",
  })
  first_payment_percent?: number;
}
