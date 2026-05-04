import { Decimal } from "@prisma/client/runtime/client";
import {
  QIStatus,
  QuoteStatus,
  type Quote,
  type QuoteItem,
} from "../../../../../src/generated/prisma/client";
import {
  QuoteContext,
} from "../../../../../src/application/use_cases/machine/contextMachine";
import { StateFactory } from "../../../../../src/application/use_cases/machine/StateFactory";
import { expect, describe, it, test, vi } from "vitest";

//=====Estados======
/**
 * 1. Create.         El usuario envia el primer mensaje y se le registra y asigna el estado "create".
 *                    Se le responde con saludo y lista de productos y se asigna el estado "Choosing"
 *
 * 2. Choosing.       Una vez el sistema recibe un producto valido(visible, existe y tiene stock)
 *                    Se le responde con parametros faltante. Se asigna el estado Quoting.
 *
 * 3. Quoting.        Se le responde con parametros faltantes.
 *                    Una vez los parametros de itemQuote estan completos se cambia el estado a "complete"
 *                    Se le responde con el resultado de la cotización
 **/

const dummyQuote: Quote = {
  id: "q-1",
  companyId: "c-1",
  clientId: "client-1",
  status: QuoteStatus.Pending,
  totalAmount: Decimal(3.9),
  pdfUrl: null,
  createdAt: new Date(),
};

describe("StateFactory", () => {
  it("creates InitializingState when quoteItem.status is Initializing", async () => {
    const dummyQuoteItem: QuoteItem = {
      id: "qi-1",
      status: QIStatus.Initializing,
      createdAt: new Date(),
      quoteId: dummyQuote.id,
      productId: "p-1",
      parameters: {},
      calculatedPrice: Decimal(2.2),
    };

    const mockQuotingUseCases = {
      getMissingParams: vi.fn(() => []),
      updateQuoteItem: vi.fn(async (qi: QuoteItem) => qi),
      updateQuote: vi.fn(async (q: Quote) => q),
      updateQuoteState: vi.fn((q: Quote, s: any) => ({ ...q, status: s })),
      updateQuoteItemState: vi.fn((qi: QuoteItem, s: any) => ({
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
    };

    const ctx = new QuoteContext(
      dummyQuote as any,
      dummyQuoteItem as any,
      mockQuotingUseCases as any
    );
    const state = StateFactory.create(ctx);
    state.activate();
    expect(state.quote.getState().constructor.name).toBe("InitializingState");
  });

  it("creates SelectingState when quoteItem.status is Selecting", async () => {
    const selectingQuoteItem: QuoteItem = {
      id: "qi-2",
      status: QIStatus.Selecting,
      createdAt: new Date(),
      quoteId: dummyQuote.id,
      productId: "p-2",
      parameters: {},
      calculatedPrice: Decimal(1.1),
    };

    const mockQuotingUseCases = {
      getMissingParams: vi.fn(() => ["param1"]),
      updateQuoteItem: vi.fn(async (qi: QuoteItem) => qi),
      updateQuote: vi.fn(async (q: Quote) => q),
      updateQuoteState: vi.fn((q: Quote, s: any) => ({ ...q, status: s })),
      updateQuoteItemState: vi.fn((qi: QuoteItem, s: any) => ({
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
    };

    const ctx = new QuoteContext(
      dummyQuote,
      selectingQuoteItem,
      mockQuotingUseCases as any
    );
    //Hoy. StateFactory simplemente crea States
    //Problema. State es del tipo SelectingState. Bien
    const state = StateFactory.create(ctx);
    //Solo si se ejecuta activate(). Cambia el estado
    state.activate()
    console.log(
      //Quote Aun tiene el undefinedState. Mal
      state.quote.getState()
    );
    
    expect(state.quote.getState().constructor.name).toBe("SelectingState");
  });
});
