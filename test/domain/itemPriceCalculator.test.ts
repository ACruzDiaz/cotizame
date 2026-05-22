import { describe, it, expect } from "vitest";
import { ItemPriceCalculator } from "../../src/domain/service/itemPriceCalculator.js";
import { QuoteItem } from "../../src/domain/quoteItem.js";
import { Product } from "../../src/domain/product.js";

describe("ItemPriceCalculator", () => {
  const mockProduct = Product.create({
    companyId: "company-1",
    name: "Test Product",
    parameters: {},
    description: "A test product",
    notes: undefined,
    basePrice: 100,
    dynamicPricingDsl: {
      rules: [
        {
          conditions: [{ field: "size", operator: "eq", value: "large" }],
          action: { operator: "add", value: 50 },
        },
      ],
    },
    deletedAt: undefined,
  });

  it("should return the base price when no rules match", () => {
    const quoteItem = QuoteItem.create("18dca623-e34c-49ca-aa6a-40e046bf3b0f", {
      productId: mockProduct.id,
      parameters: { size: "small" },
    });

    const price = ItemPriceCalculator.calculateItemPrice(
      quoteItem,
      mockProduct,
    );
    expect(price).toBe(100);
  });

  it("should calculate the item price with rules applied", () => {
    const quoteItem = QuoteItem.create("18dca623-e34c-49ca-aa6a-40e046bf3b0f", {
      productId: mockProduct.id,
      parameters: { size: "large" },
    });

    const price = ItemPriceCalculator.calculateItemPrice(
      quoteItem,
      mockProduct,
    );
    expect(price).toBe(150);
  });

  it("should throw an error if quoteItem parameters is null", () => {
    const quoteItem = QuoteItem.create("18dca623-e34c-49ca-aa6a-40e046bf3b0f", {
      productId: mockProduct.id,
      parameters: {}, // It converts to {} if null, let's see. Wait, in TS if parameters is any, we can mock it. Let's cast to any.
    });
    // Forcing parameters to be null to test the exception
    Object.defineProperty(quoteItem, "parameters", { value: null });

    expect(() =>
      ItemPriceCalculator.calculateItemPrice(quoteItem, mockProduct),
    ).toThrow("Can not add params keys does not exist nor product");
  });
});
