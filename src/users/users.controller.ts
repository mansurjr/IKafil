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
  NotFoundException,
  ParseIntPipe,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole } from "@prisma/client";
import { ApiOperation, ApiParam } from "@nestjs/swagger";

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
  @ApiOperation({ summary: "Get user by ID (safe response)" })
  @ApiParam({ name: "id", type: Number })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);

    const {
      password,
      token,
      activation_link,
      otp_code,
      otp_expire,
      resetLink,
      region_id,
      ...safeUser
    } = user;

    return safeUser;
  }

  /** =======================
   * UPDATE USER
   * ======================= */
  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  /** =======================
   * DELETE SINGLE USER
   * ======================= */
  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.remove(id);
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
