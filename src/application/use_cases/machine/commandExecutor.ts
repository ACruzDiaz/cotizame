import { ShowProductsUseCase } from "../showProducts.usecase";
import { ProductService } from "../../services/product.service";
import type { IQuotingUseCases } from "./IQuotingUseCases";
import type { Quote, QuoteItem } from "../../../generated/prisma/client";
import type { QIStatus, QuoteStatus } from "../../../generated/prisma/enums";

export type Command =
  | { type: "updateQuoteItem" }
  | { type: "updateQuote" }
  | { type: "createEmptyQuoteItem" }
  | { type: "createQuoteItemWithProduct"; payload: { productId: string } }
  | { type: "updateQuoteItemProduct"; payload: { quoteItemId: string; productId: string } }
  | { type: "updateQuoteState"; payload: { status: QuoteStatus } }
  | { type: "updateQuoteItemState"; payload: { status: QIStatus } }
  | { type: "showProducts" };

export type CommandResult =
  | { type: "updateQuoteItem"; result: QuoteItem }
  | { type: "updateQuote"; result: Quote }
  | { type: "createEmptyQuoteItem"; result: QuoteItem }
  | { type: "createQuoteItemWithProduct" }
  | { type: "updateQuoteItemProduct" }
  | { type: "updateQuoteState" }
  | { type: "updateQuoteItemState" }
  | { type: "showProducts"; result: unknown };

export interface ExecutorContext {
  quoteEntity: Quote;
  quoteItemEntity: QuoteItem;
  setQuoteItemEntity: (qi: QuoteItem) => void;
  setQuoteEntity: (q: Quote) => void;
  setResponseMessage: (msg: string) => void;
}

export async function executeCommands(
  commands: Command[],
  quotingUseCases: IQuotingUseCases,
  ctx: ExecutorContext
): Promise<CommandResult[]> {
  const results: CommandResult[] = [];
  while (commands.length > 0) {
    const cmd = commands.shift()!;
    try {
      switch (cmd.type) {
        case "updateQuoteItem": {
          const updated = await quotingUseCases.updateQuoteItem(ctx.quoteItemEntity.id, ctx.quoteItemEntity);
          results.push({ type: "updateQuoteItem", result: updated });
          break;
        }
        case "updateQuote": {
          const updated = await quotingUseCases.updateQuote(ctx.quoteEntity.id, ctx.quoteEntity);
          results.push({ type: "updateQuote", result: updated });
          break;
        }
        case "createEmptyQuoteItem": {
          const qi = await quotingUseCases.createEmptyQuoteItem(ctx.quoteEntity.id);
          ctx.setQuoteItemEntity(qi);
          results.push({ type: "createEmptyQuoteItem", result: qi });
          break;
        }
        case "createQuoteItemWithProduct": {
          await quotingUseCases.createQuoteItemWithAProduct(cmd.payload.productId, ctx.quoteEntity.id);
          results.push({ type: "createQuoteItemWithProduct" });
          break;
        }
        case "updateQuoteItemProduct": {
          await quotingUseCases.updateQuoteItemProductId(cmd.payload.quoteItemId, cmd.payload.productId);
          results.push({ type: "updateQuoteItemProduct" });
          break;
        }
        case "updateQuoteState": {
          await quotingUseCases.updateQuoteState(ctx.quoteEntity, cmd.payload.status);
          results.push({ type: "updateQuoteState" });
          break;
        }
        case "updateQuoteItemState": {
          await quotingUseCases.updateQuoteItemState(ctx.quoteItemEntity, cmd.payload.status);
          results.push({ type: "updateQuoteItemState" });
          break;
        }
        case "showProducts": {
          const res = await new ShowProductsUseCase(new ProductService()).execute({ companyId: ctx.quoteEntity.companyId });
          ctx.setResponseMessage(JSON.stringify(res));
          results.push({ type: "showProducts", result: res });
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.log("Error executing command", err);
      // decide whether to push an error result or stop execution
    }
  }
  return results;
}
