import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDecimal,
} from "class-validator";

export class CreateTradeInDto {


  @ApiProperty({
    example: 10,
    description: "Eski qurilma ID (devices jadvalidan)",
  })
  @IsNotEmpty()
  @IsNumber()
  old_device_id: number;

  @ApiProperty({
    example: 25,
    description: "Yangi qurilma ID (devices jadvalidan)",
  })
  @IsNotEmpty()
  @IsNumber()
  new_device_id: number;

  @ApiProperty({
    example: 500.0,
    description: "Eski qurilmaning taxminiy qiymati (UZS yoki USD formatida)",
  })
  @IsNotEmpty()
  @IsDecimal()
  estimated_value: number;

  @ApiProperty({
    example: false,
    required: false,
    description: "Admin tomonidan tasdiqlanganmi (optional)",
  })
  @IsOptional()
  @IsBoolean()
  approved?: boolean;

  @ApiProperty({
    example: 150.0,
    required: false,
    description: "Yangi va eski qurilmalar orasidagi farq summasi",
  })
  @IsOptional()
  @IsDecimal()
  difference_amount?: number;
}
