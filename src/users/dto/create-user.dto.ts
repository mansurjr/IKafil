import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsInt,
  IsPositive,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsNotEmpty,
} from "class-validator";
import { UserRole } from "@prisma/client";

@ValidatorConstraint({ name: "PasswordsMatch", async: false })
export class PasswordsMatch implements ValidatorConstraintInterface {
  validate(confirmPassword: any, args: ValidationArguments) {
    const object: any = args.object;
    if (object.role === UserRole.seller || object.role === UserRole.admin)
      return true;
    return object.password === confirmPassword;
  }

  defaultMessage(args: ValidationArguments) {
    return "Password and confirm password do not match";
  }
}

export class CreateUserDto {
  @ApiProperty({
    example: "john_doe_99",
    description: "The user's unique username (optional for sellers)",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Username must be a string" })
  username?: string;

  @ApiProperty({
    example: "John Doe",
    description: "The full name of the user",
  })
  @IsString({ message: "Full name must be a string" })
  full_name: string;

  @ApiProperty({
    example: "john@example.com",
    description: "The user's email address",
  })
  @IsEmail({}, { message: "Invalid email format" })
  email: string;


  @ApiProperty({
    example: "+1234567890",
    description: "The user's phone number (optional)",
    required: false,
  })
  @IsNotEmpty()
  @IsString({ message: "Phone number must be a string" })
  phone: string;

  @ApiProperty({
    example: "myStrongPassword123",
    description:
      "The user's password (at least 6 characters, required for non-sellers/admins)",
    minLength: 6,
    required: false,
  })
  @ValidateIf((o) => o.role !== UserRole.seller && o.role !== UserRole.admin)
  @IsString({ message: "Password must be a string" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password?: string;

  @ApiProperty({
    example: "myStrongPassword123",
    description:
      "Password confirmation (must match the password, required for non-sellers/admins)",
    minLength: 6,
    required: false,
  })
  @ValidateIf((o) => o.role !== UserRole.seller && o.role !== UserRole.admin)
  @IsString({ message: "Confirm password must be a string" })
  @MinLength(6, {
    message: "Confirm password must be at least 6 characters long",
  })
  @Validate(PasswordsMatch)
  confirmPassword?: string;

  @ApiProperty({
    example: UserRole.buyer,
    enum: UserRole,
    description: "The role of the user (optional)",
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: "Invalid user role selected" })
  role?: UserRole;

  @ApiProperty({
    example: 1,
    description: "The user's assigned region ID",
  })
  @IsInt({ message: "Region ID must be an integer" })
  @IsPositive({ message: "Region ID must be a positive number" })
  region_id: number;
}
