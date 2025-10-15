import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsNumber, IsPositive, IsString } from "class-validator";

export class QueryInstallmentPlanDto {
  @ApiPropertyOptional({
    example: 12,
    description: "Filtrlash uchun oylar soni",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  months: number;

  @ApiPropertyOptional({
    example: 10,
    description: "Minimal foiz stavkasi (>=)",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  percent_gte?: number;

  @ApiPropertyOptional({
    example: 20,
    description: "Maksimal foiz stavkasi (<=)",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  percent_lte?: number;

  @ApiPropertyOptional({
    example: 25,
    description: "Minimal boshlang'ich to'lov (%)",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  first_payment_percent_gte?: number;

  @ApiPropertyOptional({
    example: 50,
    description: "Maksimal boshlang'ich to'lov (%)",
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  first_payment_percent_lte?: number;

  @ApiPropertyOptional({
    example: "months",
    description: "Saralash maydoni (months, percent...)",
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    example: "desc",
    description: "Saralash yo'nalishi (asc yoki desc)",
  })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";

  @ApiPropertyOptional({
    example: 1,
    description: "Sahifa raqami (pagination uchun)",
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: "Har sahifadagi elementlar soni",
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;
}
