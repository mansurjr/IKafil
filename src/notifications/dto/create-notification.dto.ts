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
    description: "Foydalanuvchi ID si (agar mavjud bo‘lsa)",
  })
  @IsOptional()
  @IsInt({ message: "user_id butun son bo‘lishi kerak" })
  user_id?: number;

  @ApiProperty({
    example: "Yangi foydalanuvchi qo'shildi",
    description: "Xabar sarlavhasi",
  })
  @IsString({ message: "title matn bo‘lishi kerak" })
  title: string;

  @ApiProperty({
    example: "Sizning foydalanuvchingiz muvaffaqiyatli qo‘shildi",
    description: "Xabar matni",
  })
  @IsString({ message: "message matn bo‘lishi kerak" })
  message: string;

  @ApiPropertyOptional({
    example: false,
    description: "Xabar o‘qilgan yoki yo‘qligini bildiradi",
  })
  @IsOptional()
  @IsBoolean({ message: "is_read boolean qiymat bo‘lishi kerak" })
  is_read?: boolean = false;

  @ApiPropertyOptional({
    example: new Date(),
    description: "Xabar yaratilgan sana (ixtiyoriy, avtomatik belgilanadi)",
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: "created_at sana formatida bo‘lishi kerak" })
  created_at?: Date = new Date();
}
