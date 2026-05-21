import { Product } from "../product.js";
import { QuoteItem } from "../quoteItem.js";
import { evaluatePricingDsl } from "../engine/evaluator.js";
import logger from "../../application/connection/logger.dev.js";
//======= Product -> QuoteItem relationship ====================================
export class ItemPriceCalculator {
  static calculateItemPrice(quoteItem: QuoteItem, product: Product): number {
    if (quoteItem.parameters === null)
      throw new Error("Can not add params keys does not exist nor product");
    const price = evaluatePricingDsl(
      product.basePrice,
      product.dynamicPricingDsl,
      quoteItem.parameters
    );
    logger.debug(`ItemPriceCalculator result is ${price} in memory.`)
    return price;
  }
}
