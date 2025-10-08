import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsOptional } from "class-validator";

export class CreateInstallmentPlanDto {
  @ApiProperty({
    example: 6,
    description: "Necha oyga bo'lib to'lashga olish",
  })
  @IsNumber()
  @IsPositive()
  months: number;

  @ApiProperty({
    example: 10,
    description: "Foiz ko'rsatkichi (raqamda, % belgisi yo'q)",
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  percent?: number;

  @ApiProperty({
    example: 1000000,
    description: "Birinchi to'lov summasi",
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  first_payment_percent?: number;
}
