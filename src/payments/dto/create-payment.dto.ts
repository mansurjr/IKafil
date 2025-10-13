import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
} from "class-validator";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export class CreatePaymentDto {
  @ApiProperty({
    example: "150.00",
    description: "Payment amount (e.g., 150.00)",
  })
  @IsString({ message: "amount must be a string" })
  @IsNotEmpty({ message: "amount is required" })
  amount: string;

  @ApiProperty({
    example: "CASH",
    enum: PaymentMethod,
    description: "Payment method",
  })
  @IsEnum(PaymentMethod, {
    message: "method must be a valid PaymentMethod enum value",
  })
  method: PaymentMethod;

  @ApiProperty({
    example: 1,
    description: "Related contract ID",
  })
  @IsNumber({}, { message: "contract_id must be a number" })
  contract_id: number;
}