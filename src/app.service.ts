import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return "Hello World!";
  }

  async onModuleInit() {
    const superAdminEmail = "superadmin@example.com";

    const existingAdmin = await this.prisma.users.findUnique({
      where: { email: superAdminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("SuperAdmin123!", 10);
      await this.prisma.users.create({
        data: {
          email: superAdminEmail,
          password: hashedPassword,
          role: UserRole.superadmin,
          is_active: true,
          full_name: "Super Admin",
          username: superAdminEmail,
        },
      });
      console.log("✅ Superadmin created:", superAdminEmail);
    }
  }
}
