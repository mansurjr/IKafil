import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole } from "@prisma/client";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** =======================
   * CREATE USER
   * ======================= */
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  /** =======================
   * GET ALL USERS
   * ======================= */
  @Get()
  async findAll(
    @Query("page") page: string,
    @Query("limit") limit: string,
    @Query("search") search: string,
    @Query("role") role: UserRole
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    return this.usersService.findAll(
      pageNumber,
      limitNumber,
      search || "",
      role
    );
  }

  /** =======================
   * GET USER BY ID
   * ======================= */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException("Invalid user ID");
    }
    return this.usersService.findById(numericId);
  }

  /** =======================
   * UPDATE USER
   * ======================= */
  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException("Invalid user ID");
    }
    return this.usersService.update(numericId, updateUserDto);
  }

  /** =======================
   * DELETE SINGLE USER
   * ======================= */
  @Delete(":id")
  async remove(@Param("id") id: string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException("Invalid user ID");
    }
    return this.usersService.remove(numericId);
  }

  /** =======================
   * BULK DELETE USERS
   * ======================= */
  @Delete()
  async bulkRemove(@Body("ids") ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException("Please provide an array of user IDs");
    }
    return this.usersService.bulkRemove(ids);
  }
}
