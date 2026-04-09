import { prisma } from "../connection/prismaClient";
import type { Prisma, Quote } from "../../generated/prisma/client";

export class QuoteService {
  constructor() {}

  public async create(
    data: Prisma.QuoteUncheckedCreateInput,
  ): Promise<{ id: string }> {
    try {
      return await prisma.quote.create({
        data,
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create a Quote. Details: ${error}`);
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

  public async updateStatus() {

  }

  public async addQuoteItems(){
    
  }

  public async getByProperty(where: Prisma.QuoteWhereInput): Promise<Quote[]> {
    try {
      return await prisma.quote.findMany({
        where,
      });
    } catch (error) {
      throw new Error(`Failed to get quotes by property. details ${error}`);
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
