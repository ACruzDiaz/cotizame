import { Client as ClientEntity } from "../../domain/client";
import { Prisma, type Client } from "../../generated/prisma/client";

export class ClientMapper {
  static toPersistence(client: ClientEntity): Prisma.ClientUncheckedCreateInput {
    return {
      id: client.id,
      companyId: client.companyId,
      clientPhone: client.clientPhone,
      name: client.name,
      registeredAt: client.registeredAt,
    };
  }

  static toDomain(raw: Client): ClientEntity {
    return ClientEntity.fromPersistence({
      id: raw.id,
      companyId: raw.companyId,
      clientPhone: raw.clientPhone,
      name: raw.name ?? null,
      registeredAt: raw.registeredAt,
    });
  }
}
