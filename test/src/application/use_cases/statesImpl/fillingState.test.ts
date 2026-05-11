import { Decimal } from "@prisma/client/runtime/client";
import { expect, describe, it, vi } from "vitest";
import {
  QIStatus,
  QuoteStatus,
  type Quote,
  type QuoteItem,
} from "../../../../../src/generated/prisma/client";
import { QuoteContext } from "../../../../../src/application/use_cases/machine/contextMachine";
import { FillingState } from "../../../../../src/application/use_cases/machine/StateFactory";

const dummyQuote: Quote = {
  id: "q-1",
  companyId: "c-1",
  clientId: "client-1",
  status: QuoteStatus.Pending,
  totalAmount: Decimal(3.9),
  pdfUrl: null,
  createdAt: new Date(),
};

describe("FillingState", () => {
  it("filling() with no missing params should change to DoneState", async () => {
    const dummyQuoteItem: QuoteItem = {
      id: "qi-1",
      status: QIStatus.Filling,
      createdAt: new Date(),
      quoteId: dummyQuote.id,
      productId: "p-1",
      parameters: {},
      calculatedPrice: Decimal(0),
    };

    const mockQuotingUseCases = {
      getMissingParams: vi.fn(() => []),
    } as any;

    const ctx = new QuoteContext(
      dummyQuote as any,
      dummyQuoteItem as any,
      mockQuotingUseCases
    );
    const state = new FillingState(ctx as any);

    await state.filling();

    expect(ctx.getState().constructor.name).toBe("DoneState");
    expect(ctx.getQuoteEntity().status).toBe(QuoteStatus.Pending);
    expect(ctx.getQuoteItemEntity().status).toBe(QIStatus.Done);
  });

  it("filling() with missing params should stay in FillingState and set status Filling", async () => {
    const dummyQuoteItem: QuoteItem = {
      id: "qi-2",
      status: QIStatus.Filling,
      createdAt: new Date(),
      quoteId: dummyQuote.id,
      productId: "",
      parameters: {},
      calculatedPrice: Decimal(0),
    };

    const mockQuotingUseCases = {
      getMissingParams: vi.fn(() => ["param1"]),
    } as any;

    const ctx = new QuoteContext(
      dummyQuote as any,
      dummyQuoteItem as any,
      mockQuotingUseCases
    );
    const state = new FillingState(ctx as any);

    await state.filling();

    expect(ctx.getState().constructor.name).toBe("FillingState");
    expect(ctx.getQuoteEntity().status).toBe(QuoteStatus.Pending);
    expect(ctx.getQuoteItemEntity().status).toBe(QIStatus.Filling);
  });

  it("initializing(), selecting(), done() should throw 'Method not implemented.'", async () => {
    const ctx = new QuoteContext(dummyQuote as any, { ...({} as any) } as any, {} as any);
    const state = new FillingState(ctx as any);
    expect(() =>  state.initializing()).toThrow("Method not implemented.");
    expect(() =>  state.selecting()).toThrow("Method not implemented.");
    expect(() =>  state.done()).toThrow("Method not implemented.");
  });
});