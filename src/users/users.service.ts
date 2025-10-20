import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { MailService } from "../mail/mail.service";
import { v4 as uuid } from "uuid";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}

  private async _checkSuperAdmin(currentUserId?: number) {
    if (!currentUserId)
      throw new ForbiddenException("Action not allowed without current user");
    const superadmin = await this.prisma.users.findUnique({
      where: { id: currentUserId },
    });
    if (!superadmin || superadmin.role !== UserRole.superadmin) {
      throw new ForbiddenException("Only superadmin can perform this action");
    }
  }

  async createUser(
    dto: CreateUserDto,
    activationLink?: string,
    currentUserId?: number
  ) {
    if (dto.role && dto.role !== UserRole.buyer) {
      await this._checkSuperAdmin(currentUserId);
    }

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
      if (!password || !dto.confirmPassword || !username)
        throw new BadRequestException(
          "Username and password are required for buyers"
        );
      if (password !== dto.confirmPassword)
        throw new BadRequestException("Passwords do not match");
    }

    const existingUser = await this.prisma.users.findFirst({
      where: { OR: [{ email: dto.email }, { username }] },
    });
    if (existingUser)
      throw new BadRequestException(
        "User with this email or username already exists"
      );

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await this.prisma.users.create({
      data: {
        username,
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

  async updateToken(userId: number, token: string | null) {
    const hashedToken = token ? await bcrypt.hash(token, 10) : null;
    const user = await this.prisma.users.update({
      where: { id: userId },
      data: { token: hashedToken },
    });
    return { id: user.id };
  }

  async findById(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: { region: { select: { name: true } } },
    });
    if (!user) throw new NotFoundException("User not found");
    return this._excludePassword(user);
  }

  async findAll(
    page = 1,
    limit = 10,
    search = "",
    role?: UserRole,
    currentUserId?: number
  ) {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        { id: { not: currentUserId } },
        { role: { not: UserRole.superadmin } },
      ],
    };

    
    if (role) {
      where.AND.push({ role });
    }

    
    if (search) {
      where.AND.push({
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      });
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

  async findByEmailOrPhone(value: string) {
    return this.prisma.users.findFirst({
      where: { OR: [{ email: value }, { phone: value }] },
    });
  }

  async update(id: number, dto: UpdateUserDto, currentUserId?: number) {
    if (!currentUserId)
      throw new ForbiddenException("Current user is required");

    const currentUser = await this.prisma.users.findUnique({
      where: { id: currentUserId },
    });
    if (!currentUser) throw new ForbiddenException("Current user not found");

    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    if (currentUser.role === UserRole.admin) {
      if (user.role === UserRole.admin || user.role === UserRole.superadmin) {
        throw new ForbiddenException(
          "Admins cannot update other admins or superadmins"
        );
      }
    } else if (currentUser.role === UserRole.superadmin) {
    } else {
      if (currentUserId !== id) {
        throw new ForbiddenException("You can update only your own account");
      }
    }

    if (dto.role && dto.role !== user.role) {
      await this._checkSuperAdmin(currentUserId);
    }

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
      if (existingUser && existingUser.id !== id)
        throw new BadRequestException("Username already exists");
    }

    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: {
        username: dto.username,
        full_name: dto.full_name,
        phone: dto.phone,
        role: dto.role,
        region_id: dto.region_id,
        is_active: dto.isActive,
      },
    });

    return this._excludePassword(updatedUser);
  }

  async remove(id: number, currentUserId?: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    if (user.role === UserRole.admin || user.role === UserRole.superadmin) {
      await this._checkSuperAdmin(currentUserId);
    }

    await this.prisma.users.delete({ where: { id } });
    return { status: "ok" };
  }

  async bulkRemove(ids: number[], currentUserId?: number) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException("Please provide at least one user ID");
    }

    const existingUsers = await this.prisma.users.findMany({
      where: { id: { in: ids } },
    });

    if (existingUsers.length === 0) {
      throw new NotFoundException("No users found for provided IDs");
    }

    const restrictedUsers = existingUsers.filter(
      (u) => u.role === UserRole.admin || u.role === UserRole.superadmin
    );
    if (restrictedUsers.length > 0) {
      await this._checkSuperAdmin(currentUserId);
    }

    await this.prisma.users.deleteMany({
      where: { id: { in: ids } },
    });

    return { deletedCount: existingUsers.length, status: "ok" };
  }

  private _excludePassword(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
