import { prisma } from "../../application/connection/prismaClient";
import { UserMapper } from "../mappers/user.mapper";
import { User as UserEntity } from "../../domain/user";
import type { UserRepository } from "../../domain/repository/userRepository";

export class PrismaUserRepository implements UserRepository {
  async save(entity: UserEntity): Promise<UserEntity> {
    const raw = await prisma.user.create({ data: UserMapper.toPersistence(entity) });
    return UserMapper.toDomain(raw);
  }

  async update(id: string, entity: UserEntity): Promise<UserEntity> {
    const data = UserMapper.toPersistence(entity) as any;
    delete data.id;
    const raw = await prisma.user.update({ where: { id }, data });
    return UserMapper.toDomain(raw);
  }

  async findByID(id: string): Promise<UserEntity | null> {
    const raw = await prisma.user.findUnique({ where: { id } });
    if (!raw) return null;
    return UserMapper.toDomain(raw);
  }

  async getAll(): Promise<UserEntity[]> {
    const raws = await prisma.user.findMany();
    return raws.map(UserMapper.toDomain);
  }

  async remove(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
