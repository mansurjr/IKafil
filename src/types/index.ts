import { UserRole } from "@prisma/client";

export const adminRoles: UserRole[] = [
  UserRole.admin,
  UserRole.support,
  UserRole.superadmin,
];