import type { InputJsonValue } from "@prisma/client/runtime/client";
import type { QuoteItemService } from "../services/quoteItem.service";
import type { QIStatus } from "../../generated/prisma/enums";
import type { QuoteItem } from "../../generated/prisma/client";

export class ManageQuoteItemUseCase {
  constructor(private quoteItemService: QuoteItemService) {}
  async execute(
    quoteId: string,
    parameters: InputJsonValue,
    status: QIStatus
  ): Promise<QuoteItem> {
    let quoteItem = await this.quoteItemService.getLast(quoteId);
    if (!quoteItem)
      quoteItem = await this.quoteItemService.create({
        quoteId: quoteId,
        parameters: parameters,
        status: status,
        calculatedPrice: -1,
      });
    return quoteItem;
  }
}
