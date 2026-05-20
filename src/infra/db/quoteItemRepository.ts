import { prisma } from "../../application/connection/prismaClient.js";
import { QuoteItemMapper } from "../mappers/quoteItem.mapper.js";
import { QuoteItem as QuoteItemEntity } from "../../domain/quoteItem.js";
import type { QuoteItemRepository } from "../../domain/repository/quoteItemRepository.js";

export class PrismaQuoteItemRepository implements QuoteItemRepository {
  async save(entity: QuoteItemEntity): Promise<QuoteItemEntity> {
    const raw = await prisma.quoteItem.create({ data: QuoteItemMapper.toPersistence(entity) });
    return QuoteItemMapper.toDomain(raw);
  }

  async update(id: string, entity: QuoteItemEntity): Promise<QuoteItemEntity> {
    const data = QuoteItemMapper.toPersistence(entity) as any;
    delete data.id;
    const raw = await prisma.quoteItem.update({ where: { id }, data });
    return QuoteItemMapper.toDomain(raw);
  }

  async findByID(id: string): Promise<QuoteItemEntity | null> {
    const raw = await prisma.quoteItem.findUnique({ where: { id } });
    if (!raw) return null;
    return QuoteItemMapper.toDomain(raw);
  }

  async getAll(): Promise<QuoteItemEntity[]> {
    const raws = await prisma.quoteItem.findMany();
    return raws.map(QuoteItemMapper.toDomain);
  }

  async remove(id: string): Promise<void> {
    await prisma.quoteItem.delete({ where: { id } });
  }

  async updateMany(entities: QuoteItemEntity[]): Promise<QuoteItemEntity[]> {
    // Use a transaction to run all updates atomically.
    const updateActions = entities.map((entity) => {
      const data = QuoteItemMapper.toPersistence(entity) as any;
      const id = data.id;
      delete data.id;
      return prisma.quoteItem.update({ where: { id }, data });
    });

    const raws = await prisma.$transaction(updateActions);
    return raws.map(QuoteItemMapper.toDomain);
  }

  async findUniqueByClientPhoneGroupByStatusFilling(clientPhone: string): Promise<QuoteItemEntity | null>{
    const raw = await prisma.quoteItem.findFirst({
      where: {
        status: "Filling",
        quote: {
          client: {
            clientPhone,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!raw) return null;
    return QuoteItemMapper.toDomain(raw);
  }
}
