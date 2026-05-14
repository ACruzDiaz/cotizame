import { prisma } from "../../application/connection/prismaClient";
import { QuoteItemMapper } from "../mappers/quoteItem.mapper";
import { QuoteItem as QuoteItemEntity } from "../../domain/quoteItem";
import type { QuoteItemRepository } from "../../domain/repository/quoteItemRepository";

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
}
