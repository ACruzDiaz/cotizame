import { Product } from "../product";
import { QuoteItem } from "../quoteItem";
import { evaluatePricingDsl } from "../engine/evaluator";
//======= Product -> QuoteItem relationship ====================================
export class ItemPriceCalculator {
  static calculateItemPrice(quoteItem: QuoteItem, product: Product): number {
    if (quoteItem.parameters === null)
      throw new Error("Can not add params keys does not exist nor product");
    return evaluatePricingDsl(
      product.basePrice,
      product.dynamicPricingDsl,
      quoteItem.parameters
    );
  }

  // static setParams(quoteItem: QuoteItem, product: Product){
  //   quoteItem._assignProduct(product.id);
  //   quoteItem.addParams
  // }
}
