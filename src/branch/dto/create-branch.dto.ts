import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateBranchDto {
  @ApiProperty({
    example: "Tashkent city, Chilonzor district, 9th block",
    description: "Full address of the branch.",
  })
  @IsNotEmpty({ message: "Location must not be empty." })
  @IsString({ message: "Location must be a string." })
  location: string;

  @ApiProperty({
    example: 41.285937,
    description: "Latitude coordinate of the branch.",
  })
  @IsNotEmpty({ message: "Latitude must not be empty." })
  @IsNumber({}, { message: "Latitude must be a number." })
  latitude: number;

  @ApiProperty({
    example: 69.203545,
    description: "Longitude coordinate of the branch.",
  })
  @IsNotEmpty({ message: "Longitude must not be empty." })
  @IsNumber({}, { message: "Longitude must be a number." })
  longitude: number;

  @ApiProperty({
    example: 3,
    description: "Region ID (foreign key from the Region table).",
  })
  @IsNotEmpty({ message: "Region ID must not be empty." })
  @IsNumber({}, { message: "Region ID must be a number." })
  regionId: number;
}
