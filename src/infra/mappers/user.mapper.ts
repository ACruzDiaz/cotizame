import { User as UserEntity } from "../../domain/user";
import { Prisma, type User } from "../../generated/prisma/client";

export class UserMapper {
  static toPersistence(user: UserEntity): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id,
      companyId: user.companyId,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  static toDomain(raw: User): UserEntity {
    return UserEntity.fromPersistence({
      id: raw.id,
      companyId: raw.companyId,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: raw.role,
      createdAt: raw.createdAt,
    });
  }
}
