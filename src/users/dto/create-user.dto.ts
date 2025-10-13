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
  @IsString({ message: "Username matn bo‘lishi kerak" })
  username: string;

  @ApiProperty({
    example: "Qobiljon Yuldashev",
    description: "Foydalanuvchining to‘liq ismi",
  })
  @IsString({ message: "To‘liq ism matn bo‘lishi kerak" })
  full_name: string;

  @ApiProperty({
    example: "qobiljon@example.com",
    description: "Foydalanuvchining elektron pochtasi",
  })
  @IsEmail({}, { message: "Email manzili noto‘g‘ri formatda kiritilgan" })
  email: string;

  @ApiProperty({
    example: "+998901234567",
    description: "Foydalanuvchining telefon raqami (ixtiyoriy)",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Telefon raqami matn bo‘lishi kerak" })
  phone?: string;

  @ApiProperty({
    example: "myStrongPassword123",
    description: "Foydalanuvchi paroli (kamida 6 ta belgi)",
    minLength: 6,
  })
  @IsString({ message: "Parol matn bo‘lishi kerak" })
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo‘lishi kerak" })
  password: string;

  @ApiProperty({
    example: "myStrongPassword123",
    description: "Parolni tasdiqlash (password bilan bir xil bo‘lishi kerak)",
    minLength: 6,
  })
  @IsString({ message: "Tasdiqlovchi parol matn bo‘lishi kerak" })
  @MinLength(6, {
    message: "Tasdiqlovchi parol kamida 6 ta belgidan iborat bo‘lishi kerak",
  })
  confirmPassword: string;

  @ApiProperty({
    example: UserRole.buyer,
    enum: UserRole,
    description: "Foydalanuvchi roli (ixtiyoriy)",
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: "Noto‘g‘ri foydalanuvchi roli tanlangan" })
  role?: UserRole;

  @ApiProperty({
    example: 1,
    description: "Foydalanuvchining tegishli hududi (region ID)",
  })
  @IsInt({ message: "Region ID butun son bo‘lishi kerak" })
  @IsPositive({ message: "Region ID musbat son bo‘lishi kerak" })
  region_id: number;
}
