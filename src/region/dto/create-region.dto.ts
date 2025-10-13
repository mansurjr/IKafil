import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateRegionDto {
  @ApiProperty({
    example: "Toshkent",
    description: "Hudud (viloyat) nomi",
    maxLength: 100,
  })
  @IsNotEmpty({ message: "Region nomi bo‘sh bo‘lmasligi kerak" })
  @IsString({ message: "Region nomi matn bo‘lishi kerak" })
  @MaxLength(100, { message: "Region nomi 100 belgidan oshmasligi kerak" })
  name: string;
}
