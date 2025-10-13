import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateInstallmentPlanDto {
  @ApiProperty({
    example: 6,
    description:
      "Tolov muddatining davomiyligi (oylarda). Masalan: 6, 12 yoki 18 oy.",
  })
  @Type(() => Number)
  @IsNumber({}, { message: "months raqam (number) bolishi kerak" })
  @IsPositive({ message: "months musbat son (positive number) bolishi kerak" })
  months: number;

  @ApiProperty({
    example: 10,
    description: "Foiz stavkasi (raqamda, % belgisisiz). Masalan: 10 → 10%.",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "percent raqam (number) bolishi kerak" })
  @IsPositive({
    message: "percent musbat son (positive number) bolishi kerak",
  })
  percent?: number;

  @ApiProperty({
    example: 25,
    description:
      "Boshlangich tolov miqdori (foizda, % belgisisiz). Masalan: 25 → 25%.",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {},
    { message: "first_payment_percent raqam (number) bolishi kerak" }
  )
  @IsPositive({
    message: "first_payment_percent musbat son (positive number) bolishi kerak",
  })
  first_payment_percent?: number;
}
