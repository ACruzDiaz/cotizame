import { prisma } from "../connection/prismaClient";
import { type Prisma, type Client } from "../../generated/prisma/client";

export class ClientService {
  constructor() {}

  public async create(
    data: Prisma.ClientUncheckedCreateInput,
  ): Promise<Client> {
    try {
      return await prisma.client.create({
        data:{
          ...data,
          registeredAt: new Date()
        }
      });
    } catch (error) {
      throw new Error(`Failed to create a Client. Details: ${error}`);
    }
  }

  //No removemos clientes. Pero quisa deberiamos tener la opcion de bloquear a los spamers

  public async update(
    id: string,
    data: Prisma.ClientUpdateInput,
  ): Promise<{ id: string }> {
    try {
      return await prisma.client.update({
        where: { id },
        data,
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update client. details ${error}`);
    }
  }

  public async getByProperty(
    where: Prisma.ClientWhereInput,
  ): Promise<Client[]> {
    try {
      return await prisma.client.findMany({
        where,
      });
    } catch (error) {
      throw new Error(`Failed to get clients by property. details ${error}`);
    }
  }

  public async getById(id: string): Promise<Client | null> {
    try {
      return await prisma.client.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to get client by id. details ${error}`);
    }
  }
}
