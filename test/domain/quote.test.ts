import { describe, it, expect } from "vitest";
import { Quote } from "../../src/domain/quote.js";
import { QIStatus, QuoteStatus } from "../../src/generated/prisma/enums";
import { QuoteItem } from "../../src/domain/quoteItem";

//====Helpers===========

describe("Quote", () => {
  const clientId = "18dca623-e34c-49ca-aa6a-40e046bf3b0f";
  const companyId = "7208b0e8-a1b0-4180-9ace-b9d4ef678a4d";
  it("should create a quote", () => {
    const quote = Quote.create({
      clientId,
      companyId,
    });
    expect(quote.id).toBeDefined();
    expect(quote.items).toHaveLength(0);
    expect(quote.pdfUrl).toBeNull();
    expect(quote.createdAt).toBeInstanceOf(Date);
    expect(quote.status).toBe(QuoteStatus.Pending);
    expect(quote.totalAmount).toBeNull();
    expect(quote.clientId).toBe(clientId);
    expect(quote.companyId).toBe(companyId);
  });

  it("Should create a quote from persistence", () => {
    const quote = Quote.fromPersistence({
      id: "18dca623-e34c-49ca-aa6a-40e046bf3b0f",
      clientId: "18dca623-e34c-49ca-aa6a-40e046bf3b0f",
      companyId: "7208b0e8-a1b0-4180-9ace-b9d4ef678a4d",
      status: QuoteStatus.Pending,
      totalAmount: null,
      pdfUrl: null,
      items: [],
      createdAt: new Date(),
    });
    expect(quote.id).toBe("18dca623-e34c-49ca-aa6a-40e046bf3b0f");
    expect(quote.items).toHaveLength(0);
    expect(quote.pdfUrl).toBeNull();
    expect(quote.createdAt).toBeInstanceOf(Date);
    expect(quote.status).toBe(QuoteStatus.Pending);
    expect(quote.totalAmount).toBeNull();
    expect(quote.clientId).toBe("18dca623-e34c-49ca-aa6a-40e046bf3b0f");
    expect(quote.companyId).toBe("7208b0e8-a1b0-4180-9ace-b9d4ef678a4d");
  });
  it("Should add a new quoteItem", () => {
    const quote = Quote.create({
      clientId,
      companyId,
    });
    const quoteItem = quote.addItem({
      parameters: undefined,
      productId: undefined,
    });
    expect(quote.items).toHaveLength(1);
    expect(quote.items[0]).toBe(quoteItem);
  });
  it("Should throw an error if there is an incomplete quoteItem and try to add another one", () => {
    const quote = Quote.create({
      clientId,
      companyId,
    });
    quote.addItem({
      parameters: undefined,
      productId: undefined,
    });
    expect(() =>
      quote.addItem({
        parameters: undefined,
        productId: undefined,
      }),
    ).toThrow("You have incomplete quoteItems that need to be completed first");
  });
  it("Should remove a quoteItem", () => {
    const quote = Quote.create({
      clientId,
      companyId,
    });
    const quoteItem = quote.addItem({
      parameters: undefined,
      productId: undefined,
    });
    quote.removeItem(quoteItem.id);
    expect(quote.items).toHaveLength(0);
  });
  it("Should find the last quoteItem", () => {
    const quote = Quote.create({
      clientId,
      companyId,
    });
    const quoteItem = quote.addItem({
      parameters: undefined,
      productId: undefined,
    });
    expect(quote.findItem()).toBe(quoteItem);
  });
  it("Should calculate the completed quote total amount", () => {
    const quote = Quote.create({
      clientId,
      companyId,
    });
    const quoteItem = quote.addItem({
      parameters: undefined,
      productId: undefined,
    });

    quoteItem.startSelecting();
    quoteItem.assignProduct("18dca623-e34c-49ca-aa6a-40e046bf3b0f", {
      test: "boolean",
    });
    quoteItem._markParamsCompleted();
    quoteItem._setPrice(10);

    const quoteItem2 = quote.addItem({
      parameters: { test: "test" },
      productId: "18dca623-e34c-49ca-aa6a-40e046bf3b0f",
    });

    quoteItem2.startSelecting();
    quoteItem2.assignProduct("18dca623-e34c-49ca-aa6a-40e046bf3b0f", {
      test: "boolean",
    });
    quoteItem2._markParamsCompleted();
    quoteItem2._setPrice(10);

    quote.complete();
    expect(quote.totalAmount).toBe(20);
    expect(quote.status).toBe(QuoteStatus.Complete);
  });
});
