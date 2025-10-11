import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** =======================
   * CREATE USER
   * ======================= */
  async createUser(dto: CreateUserDto, activationLink?: string) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    const existingUser = await this.prisma.users.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });

    if (existingUser) {
      throw new BadRequestException(
        "User with this email or username already exists"
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        username: dto.username,
        email: dto.email,
        full_name: dto.full_name,
        phone: dto.phone || null,
        password: hashedPassword,
        role: dto.role || "buyer",
        activation_link : activationLink,
        region_id: dto.region_id || null,
      },
    });

    return this._excludePassword(user);
  }

  /** =======================
   * FIND BY EMAIL OR PHONE
   * ======================= */
  async findByEmailOrPhone(value: string) {
    const user = await this.prisma.users.findFirst({
      where: {
        OR: [{ email: value }, { phone: value }],
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  /** =======================
   * UPDATE TOKEN
   * ======================= */
  async updateToken(userId: number, token: string | null) {
    const hashedToken = token ? await bcrypt.hash(token, 10) : null;

    const user = await this.prisma.users.update({
      where: { id: userId },
      data: { token: hashedToken },
    });

    return { id: user.id };
  }

  /** =======================
   * FIND BY ID
   * ======================= */
  async findById(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        region: true,
        devices: true,
      },
    });

    if (!user) throw new NotFoundException("User not found");
    return this._excludePassword(user);
  }

  /** =======================
   * FIND ALL USERS
   * ======================= */
  async findAll() {
    const users = await this.prisma.users.findMany({
      select: {
        id: true,
        username: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        region_id: true,
        created_at: true,
      },
    });
    return users;
  }

  /** =======================
   * UPDATE USER
   * ======================= */
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    const updateData: any = {
      email: dto.email,
      username: dto.username,
      full_name: dto.full_name,
      phone: dto.phone,
      role: dto.role,
      region_id: dto.region_id,
      is_active: dto.isActive,
    };

    return this.prisma.users.update({
      where: { id },
      data: updateData,
    });
  }

  /** =======================
   * DELETE SINGLE USER
   * ======================= */
  async remove(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.users.delete({ where: { id } });
  }

  /** =======================
   * BULK DELETE USERS
   * ======================= */
  async bulkRemove(ids: number[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException("Please provide at least one user ID");
    }

    // Optional: Validate existence before deletion
    const existingUsers = await this.prisma.users.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    if (existingUsers.length === 0) {
      throw new NotFoundException("No users found for provided IDs");
    }

    await this.prisma.users.deleteMany({
      where: { id: { in: ids } },
    });

    return { deletedCount: existingUsers.length };
  }

  /** =======================
   * HELPER: EXCLUDE PASSWORD
   * ======================= */
  private _excludePassword(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
