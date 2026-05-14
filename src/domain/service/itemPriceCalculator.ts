import { Product } from "../product";
import { QuoteItem } from "../quoteItem";
import { evaluatePricingDsl } from "../engine/evaluator";

export class ItemPriceCalculator {
  static calculateItemPrice(quoteItem: QuoteItem, product: Product): number{
    return evaluatePricingDsl(
      product.basePrice,
      product.dynamicPricingDsl,
      quoteItem.parameters
    );
  }
}
