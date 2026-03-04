import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { User, Role } from '../../domain/entities/User';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  public async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        id: user.id,
        companyId: user.companyId,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role as any,
      },
    });

    return User.create({
      ...createdUser,
      role: createdUser.role as Role,
    });
  }

  public async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return User.create({
      ...user,
      role: user.role as Role,
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return User.create({
      ...user,
      role: user.role as Role,
    });
  }

  public async findByCompanyId(companyId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { companyId },
    });

    return users.map((user: any) =>
      User.create({
        ...user,
        role: user.role as Role,
      }),
    );
  }
}
