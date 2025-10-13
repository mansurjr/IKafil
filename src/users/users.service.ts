import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { Prisma, UserRole, users } from "@prisma/client";
import { MailService } from "../mail/mail.service";
import { v4 as uuid } from "uuid";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private mailService: MailService
  ) {}

  async createUser(dto: CreateUserDto, activationLink?: string) {
    let username = dto.username;
    let password = dto.password;

    const region = await this.prisma.region.findUnique({
      where: { id: dto.region_id },
    });
    if (!region) throw new BadRequestException("Region not found");

    if (dto.role === UserRole.seller || dto.role === UserRole.admin) {
      username = `${dto.role}_${uuid().slice(0, 8)}`;
      password = Math.random().toString(36).slice(-8);
    } else {
      if (dto.password !== dto.confirmPassword) {
        throw new BadRequestException("Passwords do not match");
      }
      if (!password || dto.confirmPassword || !username) {
        throw new BadRequestException(
          "Password and confirm password are required for buyers"
        );
      }
    }

    const existingUser = await this.prisma.users.findFirst({
      where: { OR: [{ email: dto.email }, { username }] },
    });
    if (existingUser) {
      throw new BadRequestException(
        "User with this email or username already exists"
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await this.prisma.users.create({
      data: {
        username: username ? username : "",
        email: dto.email,
        full_name: dto.full_name,
        phone: dto.phone || null,
        password: hashedPassword,
        role: dto.role || UserRole.buyer,
        activation_link: activationLink || null,
        region_id: dto.region_id,
        is_active:
          dto.role === UserRole.seller || dto.role === UserRole.admin
            ? true
            : false,
      },
    });

    if (dto.role === UserRole.seller || dto.role === UserRole.admin) {
      await this.mailService.sendNewCredentialsMail(user, password);
    }

    return this._excludePassword(user);
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
      include: { region: { select: { name: true } }, devices: true },
    });

    if (!user) throw new NotFoundException("User not found");
    return this._excludePassword(user);
  }

  /** =======================
   * FIND ALL USERS WITH PAGINATION AND SEARCH
   * ======================= */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    role?: UserRole
  ) {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: { created_at: "desc" },
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
    return user;
  }

  /** =======================
   * UPDATE USER
   * ======================= */
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    if (dto.region_id) {
      const region = await this.prisma.region.findUnique({
        where: { id: dto.region_id },
      });
      if (!region) throw new NotFoundException("Region not found");
    }
    if (dto.username) {
      const existingUser = await this.prisma.users.findFirst({
        where: { username: dto.username },
      });
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException("Username already exists");
      }
    }

    const updateData: UpdateUserDto = {
      username: dto.username,
      full_name: dto.full_name,
      phone: dto.phone,
      role: dto.role,
      region_id: dto.region_id,
      isActive: dto.isActive,
    };

    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: updateData,
    });
    const {
      password,
      token,
      activation_link,
      otp_code,
      otp_expire,
      resetLink,
      region_id,
      ...safeUser
    } = this._excludePassword(updatedUser);
    return safeUser;
  }

  /** =======================
   * DELETE SINGLE USER
   * ======================= */
  async remove(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    this.prisma.users.delete({ where: { id } });
    return { status: "ok" };
  }

  /** =======================
   * BULK DELETE USERS
   * ======================= */
  async bulkRemove(ids: number[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException("Please provide at least one user ID");
    }

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

    return { deletedCount: existingUsers.length, status: "ok" };
  }

  /** =======================
   * HELPER: EXCLUDE PASSWORD
   * ======================= */
  private _excludePassword(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
