import { Decimal } from "@prisma/client/runtime/client";
import { expect, describe, it, vi } from "vitest";
import {
  QIStatus,
  QuoteStatus,
  type Quote,
  type QuoteItem,
} from "../../../../../src/generated/prisma/client";
import { QuoteContext } from "../../../../../src/application/use_cases/machine/contextMachine";
import { InitializingState } from "../../../../../src/application/use_cases/machine/StateFactory";

const dummyQuote: Quote = {
  id: "q-1",
  companyId: "c-1",
  clientId: "client-1",
  status: QuoteStatus.Pending,
  totalAmount: Decimal(3.9),
  pdfUrl: null,
  createdAt: new Date(),
};

describe("InitializingState", () => {
  it("enter() should run initializing and transition to SelectingState (via changeState)", async () => {
    const dummyQuoteItem: QuoteItem = {
      id: "qi-1",
      status: QIStatus.Initializing,
      createdAt: new Date(),
      quoteId: dummyQuote.id,
      productId: "",
      parameters: {},
      calculatedPrice: Decimal(0),
    };

    const mockQuotingUseCases = {
      getMissingParams: vi.fn(() => ["p"],),
      updateQuoteItem: vi.fn(async (qi: QuoteItem) => qi),
      updateQuote: vi.fn(async (q: Quote) => q),
      updateQuoteState: vi.fn(async (q: Quote, s: any) => ({ ...q, status: s })),
      updateQuoteItemState: vi.fn(async (qi: QuoteItem, s: any) => ({ ...qi, status: s })),
      createEmptyQuoteItem: vi.fn(async (quoteId: string) => ({
        id: "empty-qi",
        status: QIStatus.Initializing,
        createdAt: new Date(),
        quoteId,
        productId: "1bc3272d-a2e2-436d-8109-201f0e3a1e6f",
        parameters: {},
        calculatedPrice: Decimal(0),
      })),
      createQuoteItemWithAProduct: vi.fn(async (productId: string, quoteId: string) => ({
        id: "created-qi",
        status: QIStatus.Selecting,
        createdAt: new Date(),
        quoteId,
        productId,
        parameters: {},
        calculatedPrice: Decimal(0),
      })),
    };

    const ctx = new QuoteContext(dummyQuote as any, dummyQuoteItem as any, mockQuotingUseCases as any);
    const state = new InitializingState(ctx as any);

    // mock showProducts and assert it's called
    (ctx as any).showProducts = vi.fn(async () => "mocked products");
    
    // call enter which should invoke initializing and perform a changeState to SelectingState
    await state.enter();

    // After enter, the quoteItem status should be Selecting and quote status Pending
    expect(ctx.getQuoteItemEntity().status).toBe(QIStatus.Selecting);
    expect(ctx.getQuoteEntity().status).toBe(QuoteStatus.Pending);

    // changeState triggers updateQuote and updateQuoteItem calls
    // expect(mockQuotingUseCases.updateQuote).toHaveBeenCalled();
    // expect(mockQuotingUseCases.updateQuoteItem).toHaveBeenCalled();
    expect((ctx as any).showProducts).toHaveBeenCalled();
  });

  it("initializing() should set statuses and change state (when called directly)", async () => {
    const dummyQuoteItem: QuoteItem = {
      id: "qi-2",
      status: QIStatus.Initializing,
      createdAt: new Date(),
      quoteId: dummyQuote.id,
      productId: "1bc3272d-a2e2-436d-8109-201f0e3a1e6f",
      parameters: {},
      calculatedPrice: Decimal(0),
    };

    const mockQuotingUseCases = {
      getMissingParams: vi.fn(() => ["p"]),
      updateQuoteItem: vi.fn(async (qi: QuoteItem) => qi),
      updateQuote: vi.fn(async (q: Quote) => q),
      updateQuoteState: vi.fn(async (q: Quote, s: any) => ({ ...q, status: s })),
      updateQuoteItemState: vi.fn(async (qi: QuoteItem, s: any) => ({ ...qi, status: s })),
      createEmptyQuoteItem: vi.fn(async (quoteId: string) => ({
        id: "empty-qi-2",
        status: QIStatus.Initializing,
        createdAt: new Date(),
        quoteId,
        productId: "1bc3272d-a2e2-436d-8109-201f0e3a1e6f",
        parameters: {},
        calculatedPrice: Decimal(0),
      })),
      createQuoteItemWithAProduct: vi.fn(async (productId: string, quoteId: string) => ({
        id: "created-qi-2",
        status: QIStatus.Selecting,
        createdAt: new Date(),
        quoteId,
        productId,
        parameters: {},
        calculatedPrice: Decimal(0),
      })),
    };

    const ctx = new QuoteContext(dummyQuote as any, dummyQuoteItem as any, mockQuotingUseCases as any);
    const state = new InitializingState(ctx as any);

    await state.initializing();

    expect(ctx.getQuoteItemEntity().status).toBe(QIStatus.Selecting);
    expect(ctx.getQuoteEntity().status).toBe(QuoteStatus.Pending);
  });

  it("selecting() should be callable and not throw", () => {
    const ctx = new QuoteContext(dummyQuote as any, { ...({} as any) } as any, {} as any);
    const state = new InitializingState(ctx as any);
    expect(() => state.selecting()).not.toThrow();
  });

  it("filling() should throw 'Method not implemented.'", () => {
    const ctx = new QuoteContext(dummyQuote as any, { ...({} as any) } as any, {} as any);
    const state = new InitializingState(ctx as any);
    expect(() => state.filling()).toThrow("Method not implemented.");
  });

  it("done() should throw 'Method not implemented.'", () => {
    const ctx = new QuoteContext(dummyQuote as any, { ...({} as any) } as any, {} as any);
    const state = new InitializingState(ctx as any);
    expect(() => state.done()).toThrow("Method not implemented.");
  });
});
