import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { UserRole } from "@prisma/client";

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  full_name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  confirmPassword: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ required: true })
  region_id: number;
}
