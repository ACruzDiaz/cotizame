import { prisma } from "../connection/prismaClient";
import {
  QuoteStatus,
  type Prisma,
  type Quote,
} from "../../generated/prisma/client";

export class QuoteService {
  constructor() {}

  public async create(data: Prisma.QuoteUncheckedCreateInput): Promise<Quote> {
    try {
      return await prisma.quote.create({
        data: { ...data, status: QuoteStatus.Pending },
      });
    } catch (error) {
      throw new Error(`Failed to create a Quote. Details: ${error}`);
    }
  }
  public async update(quote: Quote): Promise<Quote> {
    try {
      if (!quote.id) throw new Error("No se asigno una id para update");
      return await prisma.quote.update({
        where: { id: quote.id },
        data: { status: quote.status },
      });
    } catch (error) {
      throw new Error(`Failed to update a QuoteItem. Details: ${error}`);
    }
  }

  public async remove(id: string): Promise<{ id: string }> {
    try {
      return await prisma.quote.delete({
        where: { id },
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete quote. details ${error}`);
    }
  }

  public async updateStatus(quoteId: string, newStatus: QuoteStatus) {
    try {
      return await prisma.quote.update({
        where: { id: quoteId },
        data: { status: newStatus },
      });
    } catch (error) {
      throw new Error(`Failed to update quote status. details ${error}`);
    }
  }

  public async addQuoteItems() {}

  public async getByProperty(where: Prisma.QuoteWhereInput): Promise<Quote[]> {
    try {
      return await prisma.quote.findMany({
        where,
      });
    } catch (error) {
      throw new Error(`Failed to get quotes by property. details ${error}`);
    }
  }

  public async getLast(clientId: string): Promise<Quote | null> {
    try {
      return await prisma.quote.findFirst({
        where: { clientId },
        orderBy: {
          createdAt: "desc", // orden descendente
        },
      });
    } catch (error) {
      throw new Error(`Failed to get last quote. details: ${error}`);
    }
  }

  public async getById(id: string): Promise<Quote | null> {
    try {
      return await prisma.quote.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to get quote by id. details ${error}`);
    }
  }
}
