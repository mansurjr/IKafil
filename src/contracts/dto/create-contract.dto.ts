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
  @ApiProperty({ description: "Buyer user ID", example: 1 })
  @IsInt()
  buyer_id: number;

  @ApiProperty({ description: "Device ID linked to the contract", example: 5 })
  @IsInt()
  device_id: number;

  @ApiProperty({
    description: "Admin ID who created the contract",
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  admin_id?: number;

  @ApiProperty({
    description: "Installment plan ID",
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsInt()
  plan_id?: number;

  @ApiProperty({
    description: "Trade-in request ID if applicable",
    example: 4,
    required: false,
  })
  @IsOptional()
  @IsInt()
  trade_in_id?: number;

  @ApiProperty({
    description: "Total price of the contract",
    example: "1200.5",
  })
  @Type(() => Number)
  @IsNumber()
  total_price: number;

  @ApiProperty({ description: "Monthly payment amount", example: "100.42" })
  @Type(() => Number)
  @IsNumber()
  monthly_payment: number;

  @ApiProperty({ description: "Remaining balance", example: "800.25" })
  @Type(() => Number)
  @IsNumber()
  remaining_balance: number;

  @ApiProperty({ description: "Duration in months", example: 12 })
  @IsInt()
  duration_months: number;

  @ApiProperty({
    description: "Contract status",
    enum: ContractStatus,
    default: ContractStatus.active,
  })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiProperty({
    description: "Start date of the contract",
    example: "2025-10-07T00:00:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @ApiProperty({
    description: "End date of the contract",
    example: "2026-10-07T00:00:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @ApiProperty({
    description: "Whether this contract involves trade-in",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_trade_in?: boolean;
}
