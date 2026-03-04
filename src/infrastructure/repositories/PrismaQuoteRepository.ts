import { PrismaClient } from '@prisma/client';
import { IQuoteRepository } from '../../domain/interfaces/repositories/IQuoteRepository';
import { Quote, QuoteStatus, QuoteItem } from '../../domain/entities/Quote';

export class PrismaQuoteRepository implements IQuoteRepository {
  constructor(private prisma: PrismaClient) {}

  public async create(quote: Quote): Promise<Quote> {
    const created = await this.prisma.quote.create({
      data: {
        id: quote.id,
        companyId: quote.companyId,
        clientId: quote.clientId,
        status: quote.status as any,
        subtotal: quote.subtotal,
        tax: quote.tax,
        total: quote.total,
        expiresAt: quote.expiresAt,
        items: {
          create: quote.items.map((item) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    return this.mapToEntity(created);
  }

  public async findById(id: string): Promise<Quote | null> {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!quote) return null;

    return this.mapToEntity(quote);
  }

  public async findByCompanyId(companyId: string): Promise<Quote[]> {
    const quotes = await this.prisma.quote.findMany({
      where: { companyId },
      include: { items: true },
    });

    return quotes.map((q: any) => this.mapToEntity(q));
  }

  public async findByClientId(clientId: string): Promise<Quote[]> {
    const quotes = await this.prisma.quote.findMany({
      where: { clientId },
      include: { items: true },
    });

    return quotes.map((q: any) => this.mapToEntity(q));
  }

  public async update(quote: Quote): Promise<Quote> {
    const updated = await this.prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: quote.status as any,
        subtotal: quote.subtotal,
        tax: quote.tax,
        total: quote.total,
        expiresAt: quote.expiresAt,
      },
      include: { items: true },
    });

    return this.mapToEntity(updated);
  }

  private mapToEntity(data: any): Quote {
    return Quote.create({
      ...data,
      status: data.status as QuoteStatus,
      subtotal: Number(data.subtotal),
      tax: Number(data.tax),
      total: Number(data.total),
      items: data.items.map((item: any) =>
        QuoteItem.create({
          ...item,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
        }),
      ),
    });
  }
}
