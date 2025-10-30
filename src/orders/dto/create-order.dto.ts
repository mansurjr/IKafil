import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Buyurtma qilinayotgan device ID lar ro‘yxati',
    example: [145, 146],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Kamida bitta device_id kerak.' })
  device_ids: number[];
}
