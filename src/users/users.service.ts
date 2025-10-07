import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        name: dto.name,
        password: hashedPassword,
        role: dto.role ?? "buyer",
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
    };
  }

  async findByEmailOrPhone(value: string) {
    return this.prisma.users.findFirst({
      where: {
        OR: [{ email: value }, { phone: value }],
      },
    });
  }

  async updateToken(userId: number, token: string | null) {
    let hashedToken: string | null = null;

    if (token) {
      hashedToken = await bcrypt.hash(token, 10);
    }

    const user = await this.prisma.users.update({
      where: { id: userId },
      data: { token: hashedToken },
    });

    return { id: user.id };
  }

  async findById(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async findAll() {
    return this.prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    let updateData: any = {
      email: dto.email,
      phone: dto.phone,
      name: dto.name,
      role: dto.role,
    };

    if (dto.password) {
      if (dto.password !== dto.confirmPassword) {
        throw new BadRequestException("Passwords do not match");
      }
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.users.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.users.delete({
      where: { id },
    });
  }
}
