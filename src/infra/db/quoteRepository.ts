import { prisma } from "../../application/connection/prismaClient";
import { QuoteMapper } from "../mappers/quote.mapper";
import { QuoteItemMapper } from "../mappers/quoteItem.mapper";
import { Quote as QuoteEntity } from "../../domain/quote";
import type { QuoteRepository } from "../../domain/repository/quoteRepository";
import { QuoteStatus } from "../../generated/prisma/enums";

export class PrismaQuoteRepository implements QuoteRepository {
  async save(entity: QuoteEntity): Promise<QuoteEntity> {
    const raw = await prisma.quote.create({
      data: QuoteMapper.toPersistence(entity),
    });
    return QuoteMapper.toDomain(raw);
  }

  async update(id: string, entity: QuoteEntity): Promise<QuoteEntity> {
    const data = QuoteMapper.toPersistence(entity);
    delete data.id;
    const raw = await prisma.quote.update({ where: { id }, data });
    return QuoteMapper.toDomain(raw);
  }

  async findByID(id: string): Promise<QuoteEntity | null> {
    const raw = await prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!raw) return null;

    const domain = QuoteMapper.toDomain(raw);
    // map items
    const items = (raw.items ?? []).map(QuoteItemMapper.toDomain);
    // inject items into domain instance by creating from persistence again
    // QuoteMapper.toDomain returns Quote without items; construct full Quote from persistence
    return QuoteEntity.fromPersistence({
      id: raw.id,
      companyId: raw.companyId,
      clientId: raw.clientId,
      status: raw.status,
      totalAmount: raw.totalAmount === null ? null : raw.totalAmount.toNumber(),
      pdfUrl: raw.pdfUrl,
      createdAt: raw.createdAt,
      items: raw.items.map((it) => ({
        id: it.id,
        quoteId: it.quoteId,
        productId: it.productId,
        parameters: it.parameters as any,
        status: it.status,
        calculatedPrice:
          it.calculatedPrice == undefined
            ? null
            : it.calculatedPrice.toNumber(),
        createdAt: it.createdAt,
        isParamsCompleted: it.isParamsCompleted,
      })),
    });
  }

  async findLastPendingByClientId(
    clientId: string
  ): Promise<QuoteEntity | null> {
    const raw = await prisma.quote.findFirst({
      where: { clientId, status: QuoteStatus.Pending },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    if (!raw) return null;

    const domain = QuoteMapper.toDomain(raw);
    // map items
    const items = (raw.items ?? []).map(QuoteItemMapper.toDomain);
    // inject items into domain instance by creating from persistence again
    // QuoteMapper.toDomain returns Quote without items; construct full Quote from persistence
    return QuoteEntity.fromPersistence({
      id: raw.id,
      companyId: raw.companyId,
      clientId: raw.clientId,
      status: raw.status,
      totalAmount: raw.totalAmount === null ? null : raw.totalAmount.toNumber(),
      pdfUrl: raw.pdfUrl,
      createdAt: raw.createdAt,
      items: raw.items.map((it) => ({
        id: it.id,
        quoteId: it.quoteId,
        productId: it.productId,
        parameters: it.parameters as any,
        status: it.status,
        calculatedPrice:
          it.calculatedPrice == undefined
            ? null
            : it.calculatedPrice.toNumber(),
        createdAt: it.createdAt,
        isParamsCompleted: it.isParamsCompleted,
      })),
    });
  }
  async getAll(): Promise<QuoteEntity[]> {
    const raws = await prisma.quote.findMany({ include: { items: true } });
    return raws.map((raw) =>
      QuoteEntity.fromPersistence({
        id: raw.id,
        companyId: raw.companyId,
        clientId: raw.clientId,
        status: raw.status,
        totalAmount:
          raw.totalAmount === null ? null : raw.totalAmount.toNumber(),
        pdfUrl: raw.pdfUrl,
        createdAt: raw.createdAt,
        items: raw.items.map((it) => ({
          id: it.id,
          quoteId: it.quoteId,
          productId: it.productId,
          parameters: it.parameters as any,
          status: it.status,
          calculatedPrice:
            it.calculatedPrice == undefined
              ? null
              : it.calculatedPrice.toNumber(),
          createdAt: it.createdAt,
          isParamsCompleted: it.isParamsCompleted,
        })),
      })
    );
  }

  async remove(id: string): Promise<void> {
    await prisma.quote.delete({ where: { id } });
  }
}
