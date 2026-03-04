import { PrismaClient } from '@prisma/client';
import { IClientRepository } from '../../domain/interfaces/repositories/IClientRepository';
import { Client } from '../../domain/entities/Client';

export class PrismaClientRepository implements IClientRepository {
  constructor(private prisma: PrismaClient) {}

  public async create(client: Client): Promise<Client> {
    const createdClient = await this.prisma.client.create({
      data: {
        id: client.id,
        companyId: client.companyId,
        name: client.name,
        phone: client.phone,
        email: client.email,
        userId: client.userId,
      },
    });

    return Client.create(createdClient as any);
  }

  public async findById(id: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) return null;

    return Client.create(client as any);
  }

  public async findByPhone(companyId: string, phone: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: {
        companyId_phone: { companyId, phone },
      },
    });

    if (!client) return null;

    return Client.create(client as any);
  }

  public async findByCompanyId(companyId: string): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: { companyId },
    });

    return clients.map((c: any) => Client.create(c as any));
  }

  public async update(client: Client): Promise<Client> {
    const updatedClient = await this.prisma.client.update({
      where: { id: client.id },
      data: {
        name: client.name,
        phone: client.phone,
        email: client.email,
        userId: client.userId,
      },
    });

    return Client.create(updatedClient as any);
  }
}
