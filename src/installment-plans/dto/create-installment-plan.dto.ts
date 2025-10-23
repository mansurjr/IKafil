import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsPositive } from "class-validator";

export class CreateInstallmentPlanDto {
  @ApiProperty({ example: 12, description: "Oylik to'lov muddati (oylarda)" })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  months: number;

  @ApiProperty({ example: 15, description: "Yillik foiz stavkasi (%)" })
  @Type(() => Number)
  @IsNumber()
  percent: number;

  @ApiProperty({
    example: 30,
    description: "Boshlang'ich to'lov foizi (%)",
  })
  @Type(() => Number)
  @IsNumber()
  first_payment_percent: number;
}
