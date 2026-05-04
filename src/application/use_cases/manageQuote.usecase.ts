import type { Quote } from "../../generated/prisma/client";
import type { QuoteService } from "../services/quote.service";

export class ManageQuoteUseCase {
  constructor(private quoteService: QuoteService) {}
  async execute(
    companyId: string,
    clientId: string
  ): Promise<Quote> {
    let quote = await this.quoteService.getLast(clientId);
    if (!quote)
      quote = await this.quoteService.create({
        companyId: companyId,
        clientId: clientId,
        totalAmount: 0,
      });
    return quote;
  }
}
