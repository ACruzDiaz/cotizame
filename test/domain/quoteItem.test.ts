import { describe, it, expect } from "vitest";
import { QuoteItem } from "../../src/domain/quoteItem.js";

describe("QuoteItem", () => {
  it("should create a new quoteItem", () => {
    const quoteItem = QuoteItem.create("18dca623-e34c-49ca-aa6a-40e046bf3b0f", {
      productId: "18dca623-e34c-49ca-aa6a-40e046bf3b0f",
      parameters: {},
    });
    expect(quoteItem).toBeInstanceOf(QuoteItem);
  });

  it("should check if a quoteItem is in terminal state", () => {
    const isNotTerminalInitializing = QuoteItem.create(
      "18dca623-e34c-49ca-aa6a-40e046bf3b0f",
      {
        productId: "18dca223-e34c-49ca-aa6a-40e046bf3b0f",
        parameters: {},
      },
    );
    const isNotTerminalFilling = QuoteItem.fromPersistence({
      id: "18dca623-e34c-49ca-aa6a-40e046bf3b0f",
      quoteId: "12dca623-e34c-49ca-aa6a-40e046bf3b0f",
      productId: "38dca623-e34c-49ca-aa6a-40e046bf3b0f",
      parameters: { test: "test" },
      status: "Filling",
      calculatedPrice: 1,
      createdAt: new Date(),
      isParamsCompleted: true,
    });
    const isTerminalDone = QuoteItem.fromPersistence({
      id: "18dca623-e34c-49ca-aa6a-40e046bf3b0f",
      quoteId: "12dca623-e34c-49ca-aa6a-40e046bf3b0f",
      productId: "38dca623-e34c-49ca-aa6a-40e046bf3b0f",
      parameters: { test: "test" },
      status: "Done",
      calculatedPrice: 1,
      createdAt: new Date(),
      isParamsCompleted: true,
    });
    const isTerminalCanceled = QuoteItem.fromPersistence({
      id: "18dca623-e34c-49ca-aa6a-40e046bf3b0f",
      quoteId: "12dca623-e34c-49ca-aa6a-40e046bf3b0f",
      productId: "38dca623-e34c-49ca-aa6a-40e046bf3b0f",
      parameters: { test: "test" },
      status: "Canceled",
      calculatedPrice: 1,
      createdAt: new Date(),
      isParamsCompleted: true,
    });

    expect(isNotTerminalInitializing.isTerminalState()).toBe(false);
    expect(isNotTerminalFilling.isTerminalState()).toBe(false);
    expect(isTerminalDone.isTerminalState()).toBe(true);
    expect(isTerminalCanceled.isTerminalState()).toBe(true);
  });
});
