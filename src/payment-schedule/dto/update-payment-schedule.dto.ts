import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsNumber, IsDateString, IsEnum } from "class-validator";
import { PaymentStatus } from "@prisma/client";

/**
 * 🧾 DTO: Update Payment Schedule
 * Bu DTO frontend (React) dagi update form bilan 100% mos.
 * Swagger'da toliq hujjatlashtirilgan.
 */

export class UpdatePaymentScheduleDto {
  @ApiPropertyOptional({
    example: 150.75,
    description: "Tolanishi kerak bolgan summa (amount_due)",
  })
  @IsOptional()
  @IsNumber({}, { message: "amount_due raqam bolishi kerak" })
  amount_due?: number;

  @ApiPropertyOptional({
    example: 50,
    description: "Tolangan summa (paid_amount)",
  })
  @IsOptional()
  @IsNumber({}, { message: "paid_amount raqam bolishi kerak" })
  paid_amount?: number;

  @ApiPropertyOptional({
    example: "2025-12-10T00:00:00.000Z",
    description:
      "Tolov muddati (ISO formatda yuborilishi kerak — frontend uchun new Date(...).toISOString())",
  })
  @IsOptional()
  @IsDateString({}, { message: "due_date ISO formatdagi sana bolishi kerak" })
  due_date?: string;

  @ApiPropertyOptional({
    example: "pending",
    enum: PaymentStatus,
    description: "Tolov statusi (pending | paid | failed)",
  })
  @IsOptional()
  @IsEnum(PaymentStatus, {
    message: "status faqat 'pending', 'paid' yoki 'failed' bolishi mumkin",
  })
  status?: PaymentStatus;
}
