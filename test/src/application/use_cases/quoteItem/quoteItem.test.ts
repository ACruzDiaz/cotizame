import { container } from "../../../../../vitest.setup";
import {
  expect,
  describe,
  it,
  test,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import { ManageClientUseCase } from "../../../../../src/application/use_cases/ManageClient.usercase";
import { ManageQuoteItemUseCase } from "../../../../../src/application/use_cases/manageQuoteItem.usecase";
import { QuoteItemService } from "../../../../../src/application/services/quoteItem.service";
import { ClientService } from "../../../../../src/application/services/client.service";
import { CompanyService } from "../../../../../src/application/services/company.service";
import { QuoteService } from "../../../../../src/application/services/quote.service";
import { Decimal } from "@prisma/client/runtime/client";
import { QIStatus } from "../../../../../src/generated/prisma/enums";
//Pasar el formato de la tabla pnpm exec prisma migrate
describe("client use case", async () => {
  const clientService = new ClientService();
  const companyService = new CompanyService();
  const quoteService = new QuoteService();
  it("Validate ManageQuoteItemUseCase.execute() creates and return a QuoteItem", async () => {
    const body = {
      clientPhone: "6666666",
      companyPhone: "5555555",
    };
    const company = await companyService.create({
      name: "anyCompany",
      phoneNumber: "5555555",
    });
    const client = await new ManageClientUseCase(
      clientService,
      companyService
    ).execute(body);

    const quote = await quoteService.create({
      clientId: client.id,
      companyId: company.id,
      totalAmount: 0,
    });

    const quoteItem = await new ManageQuoteItemUseCase(
      new QuoteItemService()
    ).execute(quote.id, {}, QIStatus.Initializing);

    expect(quoteItem.quoteId).toBe(quote.id);
    expect(quoteItem.status).toBe(QIStatus.Initializing);
  });

  it("Validate ManageQuoteItemUseCase.execute() returns an existing QuoteItem", async () => {
    const body = {
      clientPhone: "6666666",
      companyPhone: "5555555",
    };
    const company = await companyService.create({
      name: "anyCompany",
      phoneNumber: "5555555",
    });
    const client = await new ManageClientUseCase(
      clientService,
      companyService
    ).execute(body);

    const quote = await quoteService.create({
      clientId: client.id,
      companyId: company.id,
      totalAmount: 0,
    });

    const existingQuoteItem = await new QuoteItemService().create({
      calculatedPrice: 0,
      parameters: {},
      quoteId: quote.id,
      status: QIStatus.Initializing,
    });

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    await sleep(2000);
    
    const existingQuoteItem_2 = await new QuoteItemService().create({
      calculatedPrice: 0,
      parameters: {},
      quoteId: quote.id,
      status: QIStatus.Initializing,
    });


    const quoteItem = await new ManageQuoteItemUseCase(
      new QuoteItemService()
    ).execute(quote.id, {}, QIStatus.Initializing);

    expect(quoteItem.id).toBe(existingQuoteItem_2.id);
    expect(quoteItem.status).toBe(QIStatus.Initializing);
  });

  afterAll(async () => {
    container.stop();
  });
});
