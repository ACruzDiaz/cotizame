import { prisma } from "../connection/prismaClient";
import type { Prisma, QuoteItem } from "../../generated/prisma/client";
//Este objeto debe ser inmutable

export class QuoteItemService {
  constructor() {}

  private calculatePrice() {}
  public async create(
    data: Prisma.QuoteItemUncheckedCreateInput
  ): Promise<QuoteItem> {
    try {
      return await prisma.quoteItem.create({
        data
      });
    } catch (error) {
      throw new Error(`Failed to create a QuoteItem. Details: ${error}`);
    }
  }

    public async update(
    id: string,
    data: Prisma.QuoteItemUncheckedUpdateInput
  ): Promise<QuoteItem> {
    try {
      return await prisma.quoteItem.update({
        where: { id },
        data
      });
    } catch (error) {
      throw new Error(`Failed to update product. details ${error}`);
    }
  }

  public async updateStatus(quoteItem: QuoteItem): Promise<QuoteItem>{
    try {
      if(!quoteItem.id) throw new Error("No se asigno una id para update")
      return await prisma.quoteItem.update({
        where: {id: quoteItem.id},
        data: {status: quoteItem.status}
      })
    } catch (error) {
      throw new Error(`Failed to update a QuoteItem. Details: ${error}`);
      
    }
  }
  public async remove(id: string): Promise<{ id: string }> {
    try {
      return await prisma.quoteItem.delete({
        where: { id },
        select: {
          id: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete quoteItem. details ${error}`);
    }
  }

  //Este objeto debe ser inmutable

  public async getByProperty(
    where: Prisma.QuoteItemWhereInput
  ): Promise<QuoteItem[]> {
    try {
      return await prisma.quoteItem.findMany({
        where,
      });
    } catch (error) {
      throw new Error(`Failed to get quoteItems by property. details ${error}`);
    }
  }

  public async getById(id: string): Promise<QuoteItem | null> {
    try {
      return await prisma.quoteItem.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to get quoteItem by id. details ${error}`);
    }
  }
  public async getLast(quoteId:string): Promise<QuoteItem | null> {
    try {
      return await prisma.quoteItem.findFirst({
        
        orderBy: {
          createdAt: "desc", // orden descendente
        },
        where: {quoteId}
      });
    } catch (error) {
      throw new Error(`Failed to get last quoteItem. details: ${error}`);
    }
  }
}
