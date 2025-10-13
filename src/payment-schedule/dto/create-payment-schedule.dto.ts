import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreatePaymentScheduleDto {
  @ApiProperty({
    example: 1,
    description: "Kontrakt ID si",
  })
  @IsNotEmpty()
  contract_id: number;

  @ApiProperty({
    example: new Date(),
    description: "Muddat",
  })
  @IsNotEmpty()
  due_date: Date;

  @ApiProperty({
    example: 100000,
    description: "Summa",
  })
  @IsNotEmpty()
  amount_due: number;

  @ApiProperty({
    example: 0,
    description: "To'langan summa",
  })
  @IsNotEmpty()
  paid_amount: number;
}
