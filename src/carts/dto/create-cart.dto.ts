import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({
    example: 1,
    description: 'User ID (foydalanuvchi identifikatori)',
  })
  @IsInt({ message: 'user_id butun son bo‘lishi kerak' })
  user_id: number;

  @ApiProperty({
    example: 5,
    description: 'Device ID (qurilma identifikatori)',
  })
  @IsInt({ message: 'device_id butun son bo‘lishi kerak' })
  device_id: number;

  @ApiProperty({
    example: '2025-10-08T10:00:00.000Z',
    description: 'Qo‘shilgan sana (ixtiyoriy, avtomatik belgilanadi)',
    required: false,
  })
  @IsOptional()
  added_at?: Date;
}
