import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  IsDate,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateNotificationDto {
  @ApiPropertyOptional({
    example: 1,
    description: "Foydalanuvchi ID si (agar mavjud bolsa)",
  })
  @IsOptional()
  @IsInt({ message: "user_id butun son bolishi kerak" })
  user_id?: number;

  @ApiProperty({
    example: "Yangi foydalanuvchi qo'shildi",
    description: "Xabar sarlavhasi",
  })
  @IsString({ message: "title matn bolishi kerak" })
  title: string;

  @ApiProperty({
    example: "Sizning foydalanuvchingiz muvaffaqiyatli qoshildi",
    description: "Xabar matni",
  })
  @IsString({ message: "message matn bolishi kerak" })
  message: string;

  @ApiPropertyOptional({
    example: false,
    description: "Xabar oqilgan yoki yoqligini bildiradi",
  })
  @IsOptional()
  @IsBoolean({ message: "is_read boolean qiymat bolishi kerak" })
  is_read?: boolean = false;

  @ApiPropertyOptional({
    example: new Date(),
    description: "Xabar yaratilgan sana (ixtiyoriy, avtomatik belgilanadi)",
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "created_at sana formatida bolishi kerak" })
  created_at?: Date = new Date();
}
