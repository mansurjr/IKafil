import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsInt,
  IsPositive,
} from "class-validator";
import { UserRole } from "@prisma/client";

export class CreateUserDto {
  @ApiProperty({
    example: "qobiljon_99",
    description: "Foydalanuvchining foydalanuvchi nomi (unique username)",
  })
  @IsString({ message: "Username matn bolishi kerak" })
  username: string;

  @ApiProperty({
    example: "Qobiljon Yuldashev",
    description: "Foydalanuvchining toliq ismi",
  })
  @IsString({ message: "Toliq ism matn bolishi kerak" })
  full_name: string;

  @ApiProperty({
    example: "qobiljon@example.com",
    description: "Foydalanuvchining elektron pochtasi",
  })
  @IsEmail({}, { message: "Email manzili notogri formatda kiritilgan" })
  email: string;

  @ApiProperty({
    example: "+998901234567",
    description: "Foydalanuvchining telefon raqami (ixtiyoriy)",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Telefon raqami matn bolishi kerak" })
  phone?: string;

  @ApiProperty({
    example: "myStrongPassword123",
    description: "Foydalanuvchi paroli (kamida 6 ta belgi)",
    minLength: 6,
  })
  @IsString({ message: "Parol matn bolishi kerak" })
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bolishi kerak" })
  password: string;

  @ApiProperty({
    example: "myStrongPassword123",
    description: "Parolni tasdiqlash (password bilan bir xil bolishi kerak)",
    minLength: 6,
  })
  @IsString({ message: "Tasdiqlovchi parol matn bolishi kerak" })
  @MinLength(6, {
    message: "Tasdiqlovchi parol kamida 6 ta belgidan iborat bolishi kerak",
  })
  confirmPassword: string;

  @ApiProperty({
    example: UserRole.buyer,
    enum: UserRole,
    description: "Foydalanuvchi roli (ixtiyoriy)",
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: "Notogri foydalanuvchi roli tanlangan" })
  role?: UserRole;

  @ApiProperty({
    example: 1,
    description: "Foydalanuvchining tegishli hududi (region ID)",
  })
  @IsInt({ message: "Region ID butun son bolishi kerak" })
  @IsPositive({ message: "Region ID musbat son bolishi kerak" })
  region_id: number;
}
