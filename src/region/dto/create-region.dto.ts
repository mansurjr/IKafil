import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateRegionDto {
  @ApiProperty({ example: "Tashkent", description: "Name of the region" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;
}
