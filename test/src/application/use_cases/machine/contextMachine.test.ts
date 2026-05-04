import { Decimal } from "@prisma/client/runtime/client";
import { QIStatus, QuoteStatus, type Quote, type QuoteItem } from "../../../../../src/generated/prisma/client";
import { StateFactory } from "../../../../../src/application/use_cases/machine/contextMachine";
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



//----StateFactory Test



const dummyQuote: Quote = {
  id: "string",
  companyId: "string",
  clientId: "string",
  status: QuoteStatus.Canceled,
  totalAmount: Decimal(3.9),
  pdfUrl: null,
  createdAt: new Date(),
};
const dummyQuoteItem: QuoteItem = {
  id: "string",
  status: QIStatus.Done,
  createdAt: new Date(),
  quoteId: "string",
  productId: "string",
  parameters: {},
  calculatedPrice: Decimal(2.2),
};