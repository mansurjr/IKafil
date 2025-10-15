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
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/accessToken.guard";
import { RolesGuard } from "../common/guards/role.guard";
import { Roles } from "../common/decorators/roles";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.superadmin)
  @ApiOperation({
    summary: "Create a new user",
    description: "Creates a new user with provided information and role.",
  })
  @ApiBody({ type: CreateUserDto, description: "User creation payload" })
  @ApiResponse({
    status: 201,
    description: "User successfully created.",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid data or duplicate email/phone.",
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
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

  @Get()
  @Roles(UserRole.admin, UserRole.superadmin, UserRole.support)
  @ApiOperation({
    summary: "Get all users (with pagination, search, and role filter)",
    description:
      "Retrieves paginated list of users. You can search by name/email or filter by role.",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1,
    description: "Page number for pagination (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 10,
    description: "Number of users per page (default: 10)",
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search by name, email or phone",
  })
  @ApiQuery({
    name: "role",
    required: false,
    enum: UserRole,
    description: "Filter users by role (ADMIN, CLIENT, etc.)",
  })
  @ApiResponse({
    status: 200,
    description: "List of users retrieved successfully.",
  })
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

  @Get(":id")
  @Roles(UserRole.admin, UserRole.superadmin, UserRole.support)
  @ApiOperation({
    summary: "Get user by ID (safe response)",
    description:
      "Retrieves a single user by ID. Sensitive fields like password and tokens are excluded.",
  })
  @ApiParam({ name: "id", type: Number, description: "User ID" })
  @ApiResponse({
    status: 200,
    description: "User found and returned successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "User not found.",
  })
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

  @Patch(":id")
  @Roles(UserRole.admin, UserRole.superadmin)
  @ApiOperation({
    summary: "Update user by ID",
    description: "Updates specific user data based on the provided ID.",
  })
  @ApiParam({ name: "id", type: Number, description: "User ID" })
  @ApiBody({ type: UpdateUserDto, description: "User update data" })
  @ApiResponse({
    status: 200,
    description: "User updated successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "User not found.",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @Roles(UserRole.admin, UserRole.superadmin)
  @ApiOperation({
    summary: "Delete a user by ID",
    description: "Deletes a specific user from the database by ID.",
  })
  @ApiParam({ name: "id", type: Number, description: "User ID" })
  @ApiResponse({
    status: 200,
    description: "User deleted successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "User not found.",
  })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
  @Delete()
  @Roles(UserRole.admin, UserRole.superadmin)
  @ApiOperation({
    summary: "Delete multiple users (bulk delete)",
    description: "Deletes multiple users at once by providing an array of IDs.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        ids: {
          type: "array",
          items: { type: "number" },
          example: [1, 2, 3],
          description: "Array of user IDs to delete",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Users deleted successfully.",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid or empty array of IDs provided.",
  })
  async bulkRemove(@Body("ids") ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException("Please provide an array of user IDs");
    }
    return this.usersService.bulkRemove(ids);
  }
}
