import { Quote as QuoteEntity } from "../../domain/quote.js";
import { Prisma, type Quote } from "../../generated/prisma/client.js";

export class QuoteMapper {
  static toPersistence(quote: QuoteEntity): Prisma.QuoteUncheckedCreateInput {
    return {
      id: quote.id,
      companyId: quote.companyId,
      clientId: quote.clientId,
      status: quote.status,
      totalAmount: quote.totalAmount,
      pdfUrl: quote.pdfUrl,
      createdAt: quote.createdAt,
    };
  }

  static toDomain(raw: Quote): QuoteEntity {
    return QuoteEntity.fromPersistence({
      id: raw.id,
      companyId: raw.companyId,
      clientId: raw.clientId,
      status: raw.status,
      totalAmount: raw.totalAmount === null ? null : raw.totalAmount.toNumber(),
      pdfUrl: raw.pdfUrl,
      createdAt: raw.createdAt,
      items: [],
    });
  }
}
