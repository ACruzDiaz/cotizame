import { prisma } from "../../application/connection/prismaClient";
import { ClientMapper } from "../mappers/client.mapper";
import { Client as ClientEntity } from "../../domain/client";
import type { ClientRepository } from "../../domain/repository/clientRepository";

export class PrismaClientRepository implements ClientRepository {
  async save(entity: ClientEntity): Promise<ClientEntity> {
    const raw = await prisma.client.create({
      data: ClientMapper.toPersistence(entity),
    });
    return ClientMapper.toDomain(raw);
  }

  async update(id: string, entity: ClientEntity): Promise<ClientEntity> {
    const data = ClientMapper.toPersistence(entity) as any;
    delete data.id;
    const raw = await prisma.client.update({ where: { id }, data });
    return ClientMapper.toDomain(raw);
  }

  async findByID(id: string): Promise<ClientEntity | null> {
    const raw = await prisma.client.findUnique({ where: { id } });
    if (!raw) return null;
    return ClientMapper.toDomain(raw);
  }
  async findByPhone(clientPhone: string): Promise<ClientEntity | null> {
    const raw = await prisma.client.findFirst({ where: { clientPhone } });
    if (!raw) return null;
    return ClientMapper.toDomain(raw);
  }
  async getAll(): Promise<ClientEntity[]> {
    const raws = await prisma.client.findMany();
    return raws.map(ClientMapper.toDomain);
  }

  async remove(id: string): Promise<void> {
    await prisma.client.delete({ where: { id } });
  }
}
