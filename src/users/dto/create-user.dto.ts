import { IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";
import { UserRole } from "@prisma/client";

export class CreateUserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  phone?: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  confirmPassword: string;

  @IsOptional()
  role?: UserRole;
}
