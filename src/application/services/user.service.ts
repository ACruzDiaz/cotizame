import { prisma } from "../connection/prismaClient";
import type { Prisma, User } from "../../generated/prisma/client";

export class UserService {
  constructor() {}

  public async create(
    data: Prisma.UserUncheckedCreateInput,
  ): Promise<{ id: string }> {
    try {
      return await prisma.user.create({
        data,
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create a User. Details: ${error}`);
    }
  }

  public async remove(id: string): Promise<{ id: string }> {
    try {
      return await prisma.user.delete({
        where: { id },
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete user. details ${error}`);
    }
  }

  //OJO. Para que el tipo userupdateinput permite cambiar el ID del usuario. Lo cual es peligro.
  public async update(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<{ id: string }> {
    try {
      return await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update user. details ${error}`);
    }
  }

  public async getByProperty(where: Prisma.UserWhereInput): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        where,
      });
    } catch (error) {
      throw new Error(`Failed to get users by property. details ${error}`);
    }
  }

  public async getById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to get user by id. details ${error}`);
    }
  }
}
