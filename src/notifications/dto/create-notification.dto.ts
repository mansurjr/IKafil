import { ApiProperty } from "@nestjs/swagger";

export class CreateNotificationDto {
  @ApiProperty({
    example: 1,
    description: "Foydalanuvchi ID si",
  })
  user_id?: number;

  @ApiProperty({
    example: "Yangi foydalanuvchi qo'shildi",
    description: "Xabar sarlavhasi",
  })
  title: string;

  @ApiProperty({
    example: "Sizning foydalanuvchilingiz qo'shildi",
    description: "Xabar matnini",
  })
  message: string;

  @ApiProperty({
    example: false,
    description: "Xabar o'qilgan yoki o'qilmaganini",
  })
  is_read: boolean;

  @ApiProperty({
    example: new Date(),
    description: "Xabar yaratilgan vaqti",
  })
  created_at: Date;
}
