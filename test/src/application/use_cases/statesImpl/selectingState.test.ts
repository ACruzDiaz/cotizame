import { Decimal } from "@prisma/client/runtime/client";
import { expect, describe, it, vi } from "vitest";
import {
  QIStatus,
  QuoteStatus,
  type Quote,
  type QuoteItem,
} from "../../../../../src/generated/prisma/client";
import { QuoteContext } from "../../../../../src/application/use_cases/machine/contextMachine";
import { SelectingState } from "../../../../../src/application/use_cases/machine/StateFactory";

const dummyQuote: Quote = {
  id: "q-1",
  companyId: "c-1",
  clientId: "client-1",
  status: QuoteStatus.Pending,
  totalAmount: Decimal(3.9),
  pdfUrl: null,
  createdAt: new Date(),
};

describe("SelectingState", () => {
  it("selecting() with product and no missing params should change to DoneState", async () => {
    const dummyQuoteItem: QuoteItem = {
      id: "qi-1",
      status: QIStatus.Selecting,
      createdAt: new Date(),
      quoteId: dummyQuote.id,
      productId: "p-1",
      parameters: {},
      calculatedPrice: Decimal(0),
    };

    const mockQuotingUseCases = {
      getMissingParams: vi.fn(() => []),
      updateQuoteItem: vi.fn(async (qi: QuoteItem) => qi),
      updateQuote: vi.fn(async (q: Quote) => q),
      updateQuoteState: vi.fn(async (q: Quote, s: any) => ({
        ...q,
        status: s,
      })),
      updateQuoteItemState: vi.fn(async (qi: QuoteItem, s: any) => ({
        ...qi,
        status: s,
      })),
      createEmptyQuoteItem: vi.fn(async (quoteId: string) => ({
        id: "empty-qi",
        status: QIStatus.Initializing,
        createdAt: new Date(),
        quoteId,
        productId: "",
        parameters: {},
        calculatedPrice: Decimal(0),
      })),
      createQuoteItemWithAProduct: vi.fn(
        async (productId: string, quoteId: string) => ({
          id: "created-qi",
          status: QIStatus.Selecting,
          createdAt: new Date(),
          quoteId,
          productId,
          parameters: {},
          calculatedPrice: Decimal(0),
        })
      ),
    } as any;

    const product = { id: "p-1" } as any;
    const ctx = new QuoteContext(
      dummyQuote as any,
      dummyQuoteItem as any,
      mockQuotingUseCases,
      product as any
    );
    const state = new SelectingState(ctx as any);
    // state.activate()
    // call selecting which should call setProduct and then, since no missing params, change state to DoneState
    await state.selecting();

    expect(mockQuotingUseCases.createQuoteItemWithAProduct).toHaveBeenCalled();
    expect(ctx.getState().constructor.name).toBe("DoneState");
    expect(ctx.getQuoteEntity().status).toBe(QuoteStatus.Pending);
    expect(ctx.getQuoteItemEntity().status).toBe(QIStatus.Done);
  });

  it("selecting() without product and with missing params should change to FillingState", async () => {
    const dummyQuoteItem: QuoteItem = {
      id: "qi-2",
      status: QIStatus.Selecting,
      createdAt: new Date(),
      quoteId: dummyQuote.id,
      productId: "",
      parameters: {},
      calculatedPrice: Decimal(0),
    };

    const mockQuotingUseCases = {
      getMissingParams: vi.fn(() => ["param1"]),
      updateQuoteItem: vi.fn(async (qi: QuoteItem) => qi),
      updateQuote: vi.fn(async (q: Quote) => q),
      updateQuoteState: vi.fn(async (q: Quote, s: any) => ({
        ...q,
        status: s,
      })),
      updateQuoteItemState: vi.fn(async (qi: QuoteItem, s: any) => ({
        ...qi,
        status: s,
      })),
      createEmptyQuoteItem: vi.fn(async (quoteId: string) => ({
        id: "empty-qi-2",
        status: QIStatus.Initializing,
        createdAt: new Date(),
        quoteId,
        productId: "",
        parameters: {},
        calculatedPrice: Decimal(0),
      })),
      createQuoteItemWithAProduct: vi.fn(
        async (productId: string, quoteId: string) => ({
          id: "created-qi-2",
          status: QIStatus.Selecting,
          createdAt: new Date(),
          quoteId,
          productId,
          parameters: {},
          calculatedPrice: Decimal(0),
        })
      ),
    } as any;

    const ctx = new QuoteContext(
      dummyQuote as any,
      dummyQuoteItem as any,
      mockQuotingUseCases
    );
    const state = new SelectingState(ctx as any);

    await state.selecting();

    expect(ctx.getState().constructor.name).toBe("FillingState");
    expect(ctx.getQuoteEntity().status).toBe(QuoteStatus.Pending);
    expect(ctx.getQuoteItemEntity().status).toBe(QIStatus.Filling);
  });

  it("initializing(), filling() should throw 'Method not implemented.' and done() should throw", async () => {
    const ctx = new QuoteContext(
      dummyQuote as any,
      { ...({} as any) } as any,
      {} as any
    );
    const state = new SelectingState(ctx as any);
    expect(() => state.initializing()).toThrow("Method not implemented.");
    expect(() => state.filling()).toThrow("Method not implemented.");
    await expect(state.done()).rejects.toThrow("Method not implemented.");
  });
});
